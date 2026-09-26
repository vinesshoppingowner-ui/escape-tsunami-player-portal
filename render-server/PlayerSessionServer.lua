-- PlayerSessionServer.lua
-- Place in ServerScriptService. Reports player joins/leaves to the portal's Analytics player count.
-- Requires: Game Settings > Security > "Allow HTTP Requests" = ON

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

local ENDPOINT = "https://tsunami-shield-portal.base44.app/functions/gameSessions"
local API_KEY = "PASTE_YOUR_GAME_LOG_API_KEY_HERE" -- must match the GAME_LOG_API_KEY secret in the portal

local SERVER_NAME = game.PrivateServerId ~= "" and ("Private " .. string.sub(game.JobId, 1, 6))
	or ("Server " .. string.sub(game.JobId, 1, 6))

local function send(events)
	local ok, err = pcall(function()
		HttpService:PostAsync(
			ENDPOINT,
			HttpService:JSONEncode({ events = events }),
			Enum.HttpContentType.ApplicationJson,
			false,
			{ ["X-Api-Key"] = API_KEY }
		)
	end)
	if not ok then
		warn("[PlayerSessions] failed to send:", err)
	end
end

local function event(kind, player)
	return {
		type = kind,
		roblox_username = player.Name,
		roblox_user_id = tostring(player.UserId),
		display_name = player.DisplayName,
		is_premium = player.MembershipType == Enum.MembershipType.Premium,
		server_name = SERVER_NAME,
		timestamp = DateTime.now():ToIsoDate(),
	}
end

Players.PlayerAdded:Connect(function(player)
	task.spawn(send, { event("join", player) })
end)

for _, player in ipairs(Players:GetPlayers()) do
	task.spawn(send, { event("join", player) })
end

Players.PlayerRemoving:Connect(function(player)
	task.spawn(send, { event("leave", player) })
end)

-- When the server shuts down, close every remaining session in one request
game:BindToClose(function()
	local events = {}
	for _, player in ipairs(Players:GetPlayers()) do
		table.insert(events, event("leave", player))
	end
	if #events > 0 then send(events) end
end)