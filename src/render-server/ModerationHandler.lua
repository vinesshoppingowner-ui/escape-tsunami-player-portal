-- 🛡️ ModerationHandler — Base44 Portal Sync & Roblox BanAsync Edition
-- Corrected: removes render-server dependency, fixes duration calculation,
-- and replaces MessagingService with HTTP polling for real-time enforcement.
--
-- ⚠️ The original script's MessagingService listener could NOT receive messages
-- from the Base44 dashboard — MessagingService only works server-to-server within
-- Roblox. Real-time bans are now enforced via a polling loop (section 6) that
-- checks the Base44 portal every 15 seconds.

local HttpService       = game:GetService("HttpService")
local Players           = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TextService       = game:GetService("TextService")

-- ── CONFIG ───────────────────────────────────────────────

local PORTAL_LOG_URL    = "https://tsunami-shield-portal.base44.app/functions/submit-game-logs"
local GET_WARNINGS_URL  = "https://tsunami-shield-portal.base44.app/functions/getPlayerWarnings"
local CHECK_BAN_URL     = "https://tsunami-shield-portal.base44.app/functions/checkPlayerBan"
local GAME_LOG_API_KEY  = "etfd-chat-8Kq2mZp9Xw4Lr7Vn"

local BAN_POLL_INTERVAL = 15  -- seconds between real-time ban checks

-- Track warnings already shown and players already banned this session
local shownWarningIds = {}
local bannedUserIds   = {}

-- Ensure RemoteEvent exists
local warnRemote = ReplicatedStorage:FindFirstChild("WarnRemote") or ReplicatedStorage:FindFirstChild("ShowWarning")
if not warnRemote then
	warnRemote = Instance.new("RemoteEvent")
	warnRemote.Name = "WarnRemote"
	warnRemote.Parent = ReplicatedStorage
end

print("🛡️ ModerationHandler Online: Portal Sync & BanAsync Ready.")

-- ── HELPERS ──────────────────────────────────────────────

local function robloxFiltered(player, message)
	local filteredText = message
	pcall(function()
		local filterResult = TextService:FilterStringAsync(message, player.UserId)
		filteredText = filterResult:GetNonChatStringForBroadcastAsync()
	end)
	return filteredText
end

-- ── 1. NATIVE BANASYNC ───────────────────────────────────

local function applyRobloxBan(targetUserId, targetPlayerObj, banReason, adminName, durationVal, caseId)
	if not targetUserId then return end

	local rawCaseNumber = caseId or ("#CASE-" .. math.random(10000, 99999))
	local formattedReason = (banReason and banReason ~= "") and banReason or "Website Moderation Action"
	local displayMsg = string.format("Reason: %s\nCase ID: %s\nModerator: %s", formattedReason, rawCaseNumber, adminName or "Dashboard Admin")

	local durationSec = -1
	if type(durationVal) == "number" and durationVal > 0 then
		durationSec = durationVal
	end

	local banConfig = {
		UserIds = { targetUserId },
		Duration = durationSec,
		DisplayReason = displayMsg,
		PrivateReason = string.format("Banned by %s | Case: %s", adminName or "Admin", rawCaseNumber),
		ApplyToAnyAssociatedUser = true
	}

	task.spawn(function()
		local ok, err = pcall(function()
			Players:BanAsync(banConfig)
		end)

		-- Fallback kick if BanAsync fails or the player is currently online
		if targetPlayerObj and targetPlayerObj:IsDescendantOf(Players) then
			task.delay(1, function()
				if targetPlayerObj:IsDescendantOf(Players) then
					targetPlayerObj:Kick("\n[ACCOUNT RESTRICTED]\n" .. displayMsg)
				end
			end)
		end

		if not ok then
			warn("⚠️ BanAsync failed for UserId " .. tostring(targetUserId) .. ": " .. tostring(err))
		end
	end)
end

local function removeRobloxBan(targetUserId)
	if not targetUserId then return end
	task.spawn(function()
		local ok, err = pcall(function()
			Players:UnbanAsync({
				UserIds = { targetUserId },
				ApplyToAnyAssociatedUser = true
			})
		end)
		if not ok then
			warn("⚠️ UnbanAsync failed for UserId " .. tostring(targetUserId) .. ": " .. tostring(err))
		end
	end)
end

-- ── 2. PORTAL BAN CHECK ──────────────────────────────────
-- Replaces fetchBanFromRender — queries the Base44 Moderation entity directly.

local function checkPortalBan(player)
	local success, response = pcall(function()
		return HttpService:RequestAsync({
			Url     = CHECK_BAN_URL,
			Method  = "POST",
			Headers = {
				["Content-Type"] = "application/json",
				["X-Api-Key"]    = GAME_LOG_API_KEY
			},
			Body    = HttpService:JSONEncode({ roblox_username = player.Name })
		})
	end)
	if not success or not response or not response.Success then return nil end
	local ok, data = pcall(function() return HttpService:JSONDecode(response.Body) end)
	if not ok or not data or not data.banned then return nil end
	return data
end

-- ── 3. CHAT TELEMETRY ────────────────────────────────────

local function sendChatToBackend(player, msg)
	if not msg or msg == "" then return end
	local cleanMsg = robloxFiltered(player, msg)
	pcall(function()
		HttpService:RequestAsync({
			Url     = PORTAL_LOG_URL,
			Method  = "POST",
			Headers = {
				["Content-Type"] = "application/json",
				["X-Api-Key"]    = GAME_LOG_API_KEY
			},
			Body    = HttpService:JSONEncode({
				chat_logs = {
					{
						roblox_username  = player.Name,
						message          = msg,
						filtered_message = cleanMsg,
						server_name      = game.JobId ~= "" and game.JobId or "Studio/LocalServer",
						timestamp        = os.date("!%Y-%m-%dT%H:%M:%SZ")
					}
				}
			})
		})
	end)
end

-- ── 4. WARNING FETCH ─────────────────────────────────────

local function fetchLatestWarningOnJoin(player)
	task.spawn(function()
		task.wait(2)
		local success, response = pcall(function()
			return HttpService:RequestAsync({
				Url     = GET_WARNINGS_URL,
				Method  = "POST",
				Headers = {
					["Content-Type"] = "application/json",
					["X-Api-Key"]    = GAME_LOG_API_KEY
				},
				Body    = HttpService:JSONEncode({ roblox_username = player.Name })
			})
		end)
		if not success or not response or not response.Success then return end
		local ok, data = pcall(function() return HttpService:JSONDecode(response.Body) end)
		if not ok or not data or type(data) ~= "table" then return end

		local warnings = data.warnings or data
		if type(warnings) ~= "table" or #warnings == 0 then return end

		local latestWarn = warnings[#warnings]
		local warnId = latestWarn.id or latestWarn.caseId or (latestWarn.reason .. "_" .. tostring(latestWarn.timestamp or ""))

		if not shownWarningIds[warnId] then
			shownWarningIds[warnId] = true
			if player:IsDescendantOf(Players) then
				warnRemote:FireClient(
					player,
					latestWarn.reason or latestWarn.message or "Warning on Record",
					latestWarn.admin or latestWarn.issued_by or "Dashboard Admin",
					latestWarn.caseId or latestWarn.id or "#WARN"
				)
			end
		end
	end)
end

-- ── 5. PLAYER JOIN ────────────────────────────────────────

local function hookPlayer(player)
	player.Chatted:Connect(function(msg)
		task.spawn(sendChatToBackend, player, msg)
	end)

	local banData = checkPortalBan(player)
	if banData then
		bannedUserIds[player.UserId] = true
		applyRobloxBan(player.UserId, player, banData.reason, banData.admin, banData.durationSeconds, banData.caseId)
	else
		fetchLatestWarningOnJoin(player)
	end
end

Players.PlayerAdded:Connect(hookPlayer)
for _, p in ipairs(Players:GetPlayers()) do hookPlayer(p) end

-- ── 6. REAL-TIME BAN POLLING ────────────────────────────
-- Replaces the MessagingService listener. Polls the Base44 portal every
-- BAN_POLL_INTERVAL seconds for new bans on currently-online players.
-- This is the only way to detect dashboard-issued bans in real time without
-- a render server or Open Cloud MessagingService publisher.

task.spawn(function()
	while task.wait(BAN_POLL_INTERVAL) do
		for _, player in ipairs(Players:GetPlayers()) do
			if not bannedUserIds[player.UserId] then
				local banData = checkPortalBan(player)
				if banData then
					bannedUserIds[player.UserId] = true
					applyRobloxBan(player.UserId, player, banData.reason, banData.admin, banData.durationSeconds, banData.caseId)
				end
			end
		end
	end
end)

-- ── 7. EXPLOIT DETECTION ─────────────────────────────────

local EXPLOIT_CHECK_INTERVAL = 0.5
local TELEPORT_THRESHOLD     = 400
local FLY_TIME_THRESHOLD     = 6
local FLAG_COOLDOWN          = 15

local playerStates = {}

local function sendExploitLog(player, exploitType, details)
	-- Uses the existing submit-game-logs function (handles exploit_logs)
	pcall(function()
		HttpService:RequestAsync({
			Url     = PORTAL_LOG_URL,
			Method  = "POST",
			Headers = {
				["Content-Type"] = "application/json",
				["X-Api-Key"]    = GAME_LOG_API_KEY
			},
			Body    = HttpService:JSONEncode({
				exploit_logs = {
					{
						roblox_username = player.Name,
						exploit_type   = exploitType,
						details        = details,
						server_name    = game.JobId ~= "" and game.JobId or "Studio/LocalServer",
						timestamp      = os.date("!%Y-%m-%dT%H:%M:%SZ")
					}
				}
			})
		})
	end)
end

local function checkExploits(player)
	local char = player.Character
	if not char then return end
	local hrp = char:FindFirstChild("HumanoidRootPart")
	local humanoid = char:FindFirstChild("Humanoid")
	if not hrp or not humanoid then return end

	local state = playerStates[player.UserId]
	if not state then
		state = { lastPos = hrp.Position, lastTime = os.clock(), airTime = 0, lastFlag = 0 }
		playerStates[player.UserId] = state
	end

	local now = os.clock()
	local dt = now - state.lastTime
	if dt < 0.1 then return end

	local distance = (hrp.Position - state.lastPos).Magnitude
	local studsPerSec = distance / dt

	if studsPerSec > TELEPORT_THRESHOLD then
		if now - state.lastFlag > FLAG_COOLDOWN then
			state.lastFlag = now
			sendExploitLog(player, "Teleport",
				string.format("Moved %.0f studs in %.1fs (%.0f studs/s) — pos: %s",
					distance, dt, studsPerSec, tostring(hrp.Position)))
		end
	end

	local inAir = humanoid:GetState() == Enum.HumanoidStateType.Freefall
		or humanoid:GetState() == Enum.HumanoidStateType.Jumping
	local yVel = hrp.AssemblyLinearVelocity.Y

	if inAir and math.abs(yVel) < 8 and not humanoid.FloorMaterial then
		state.airTime = state.airTime + dt
		if state.airTime > FLY_TIME_THRESHOLD and now - state.lastFlag > FLAG_COOLDOWN then
			state.lastFlag = now
			state.airTime = 0
			sendExploitLog(player, "Fly",
				string.format("Hovering at Y=%.1f for %.1fs (Y velocity: %.1f)",
					hrp.Position.Y, state.airTime + FLY_TIME_THRESHOLD, yVel))
		end
	else
		state.airTime = 0
	end

	state.lastPos = hrp.Position
	state.lastTime = now
end

task.spawn(function()
	while task.wait(EXPLOIT_CHECK_INTERVAL) do
		for _, player in ipairs(Players:GetPlayers()) do
			pcall(checkExploits, player)
		end
	end
end)

Players.PlayerRemoving:Connect(function(player)
	playerStates[player.UserId] = nil
	bannedUserIds[player.UserId] = nil
end)