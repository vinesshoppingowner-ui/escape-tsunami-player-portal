-- ChatRelayServer.lua
-- Place in ServerScriptService. Sends every in-game chat message to the portal's Live Chat tab.
-- Requires: Game Settings > Security > "Allow HTTP Requests" = ON

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

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

local function onChatted(player, message)
	table.insert(queue, {
		roblox_username = player.Name,
		message = message,
		server_name = SERVER_NAME,
		timestamp = DateTime.now():ToIsoDate(),
	})
end

Players.PlayerAdded:Connect(function(player)
	player.Chatted:Connect(function(message)
		onChatted(player, message)
	end)
end)

for _, player in ipairs(Players:GetPlayers()) do
	player.Chatted:Connect(function(message)
		onChatted(player, message)
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