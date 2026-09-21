-- WarningFetchServer.lua
-- Place in ServerScriptService, next to ChatRelayServer.
-- Pulls a player's ACTIVE warnings from the portal when they join and fires them
-- to your warning GUI through a RemoteEvent named "ShowWarning".
-- Requires: Game Settings > Security > "Allow HTTP Requests" = ON

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local ENDPOINT = "https://tsunami-shield-portal.base44.app/functions/getPlayerWarnings"
local API_KEY = "PASTE_YOUR_GAME_LOG_API_KEY_HERE" -- same GAME_LOG_API_KEY secret as the chat relay

-- RemoteEvent your warning GUI listens to. Created here if it doesn't exist.
local showWarning = ReplicatedStorage:FindFirstChild("ShowWarning")
if not showWarning then
	showWarning = Instance.new("RemoteEvent")
	showWarning.Name = "ShowWarning"
	showWarning.Parent = ReplicatedStorage
end

local function fetchWarnings(username)
	local ok, result = pcall(function()
		local raw = HttpService:PostAsync(
			ENDPOINT,
			HttpService:JSONEncode({ roblox_username = username }),
			Enum.HttpContentType.ApplicationJson,
			false,
			{ ["X-Api-Key"] = API_KEY }
		)
		return HttpService:JSONDecode(raw)
	end)

	if not ok then
		warn("[WarningFetch] failed for", username, result)
		return nil
	end
	return result
end

local function onPlayerAdded(player)
	task.wait(3) -- let the GUI load in first
	local data = fetchWarnings(player.Name)
	if not data or not data.warnings then return end

	for _, warning in ipairs(data.warnings) do
		if player.Parent then
			-- Your GUI receives: reason, details, staff_member, date
			showWarning:FireClient(player, warning)
			task.wait(1)
		end
	end
end

Players.PlayerAdded:Connect(function(player)
	task.spawn(onPlayerAdded, player)
end)

for _, player in ipairs(Players:GetPlayers()) do
	task.spawn(onPlayerAdded, player)
end