--[[
	Escape Tsunami — MAIN GAME Teleport Script
	Put this in ServerScriptService of your MAIN game (NOT Ban Land).
	Checks the Render server when a player joins and teleports them to Ban Land if banned.
]]

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local TeleportService = game:GetService("TeleportService")

local BAN_SERVER_URL = "https://escape-tsunami-bans.onrender.com"
local BAN_LAND_PLACE_ID = 0000000000 -- <<< REPLACE WITH YOUR BAN LAND PLACE ID

local teleporting = {}

local function checkBanStatus(username)
	local url = BAN_SERVER_URL .. "/api/check?username=" .. HttpService:UrlEncode(username)

	local success, response = pcall(function()
		return HttpService:GetAsync(url)
	end)

	if not success then
		warn("[BanCheck] HTTP failed for " .. username .. ": " .. tostring(response))
		return nil
	end

	local ok, data = pcall(function()
		return HttpService:JSONDecode(response)
	end)

	if not ok or type(data) ~= "table" then
		warn("[BanCheck] JSON parse failed: " .. tostring(response))
		return nil
	end

	return data
end

Players.PlayerAdded:Connect(function(player)
	task.wait(3) -- give the player a moment to load

	if teleporting[player.UserId] then return end

	local data = checkBanStatus(player.Name)

	-- Retry once (Render cold start)
	if not data then
		task.wait(4)
		data = checkBanStatus(player.Name)
	end

	if data and data.banned == true then
		print("[BanCheck] " .. player.Name .. " is banned — teleporting to Ban Land")
		teleporting[player.UserId] = true

		local ok, err = pcall(function()
			TeleportService:Teleport(BAN_LAND_PLACE_ID, player)
		end)

		if not ok then
			warn("[BanCheck] Teleport failed for " .. player.Name .. ": " .. tostring(err))
			teleporting[player.UserId] = nil
		end
	else
		print("[BanCheck] " .. player.Name .. " is not banned")
	end
end)

Players.PlayerRemoving:Connect(function(player)
	teleporting[player.UserId] = nil
end)