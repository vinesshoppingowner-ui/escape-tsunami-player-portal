-- ChatRelayServer.lua
-- Place in ServerScriptService. Sends every in-game chat message to the portal's Live Chat tab.
-- Requires: Game Settings > Security > "Allow HTTP Requests" = ON

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local TextService = game:GetService("TextService")

local ENDPOINT = "https://tsunami-shield-portal.base44.app/functions/submit-game-logs"
local API_KEY = "PASTE_YOUR_GAME_LOG_API_KEY_HERE" -- must match the GAME_LOG_API_KEY secret in the portal

local SERVER_NAME = game.PrivateServerId ~= "" and ("Private " .. string.sub(game.JobId, 1, 6))
	or ("Server " .. string.sub(game.JobId, 1, 6))

local queue = {}

local function flush()
	if #queue == 0 then return end
	local batch = queue
	queue = {}
	local ok, err = pcall(function()
		HttpService:PostAsync(
			ENDPOINT,
			HttpService:JSONEncode({ chat_logs = batch }),
			Enum.HttpContentType.ApplicationJson,
			false,
			{ ["X-Api-Key"] = API_KEY }
		)
	end)
	if not ok then
		warn("[ChatRelay] failed to send chat batch:", err)
	end
end

-- Run Roblox's own text filter. If Roblox censors or rephrases anything, the
-- result differs from what the player typed and the portal marks it flagged.
local function robloxFiltered(player, message)
	local ok, result = pcall(function()
		local filterResult = TextService:FilterStringAsync(message, player.UserId)
		local okText, text = pcall(function()
			return filterResult:GetNonChatStringForBroadcastAsync()
		end)
		if not okText then
			-- Fall back to the per-user chat version if the broadcast call fails
			text = filterResult:GetChatForUserAsync(player.UserId)
		end
		return text
	end)
	if ok and type(result) == "string" and result ~= message then
		return result
	end
	if not ok then
		warn("[ChatRelay] filter failed:", result)
	end
	return nil
end

local function onChatted(player, message)
	table.insert(queue, {
		roblox_username = player.Name,
		message = message,
		filtered_message = robloxFiltered(player, message),
		server_name = SERVER_NAME,
		timestamp = DateTime.now():ToIsoDate(),
	})
end

Players.PlayerAdded:Connect(function(player)
	player.Chatted:Connect(function(message)
		task.spawn(onChatted, player, message)
	end)
end)

for _, player in ipairs(Players:GetPlayers()) do
	player.Chatted:Connect(function(message)
		task.spawn(onChatted, player, message)
	end)
end

-- Send queued messages every 2 seconds (batched to stay under Roblox HTTP limits)
task.spawn(function()
	while true do
		task.wait(2)
		flush()
	end
end)

game:BindToClose(flush)