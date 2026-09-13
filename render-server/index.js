const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "bans.json");

function loadBans() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveBans(bans) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(bans, null, 2));
}

// Called by the Roblox game on player join
app.get("/api/check", (req, res) => {
  const username = (req.query.username || "").trim();
  if (!username) return res.json({ banned: false });

  const bans = loadBans();
  const ban = bans[username.toLowerCase()];
  if (ban) {
    res.json({ banned: true, ...ban });
  } else {
    res.json({ banned: false });
  }
});

// Called by the admin dashboard when a ban is issued
app.post("/api/ban", (req, res) => {
  const { username, type, reason, duration, staff, details } = req.body;
  if (!username) return res.status(400).json({ error: "Missing username" });

  const bans = loadBans();
  bans[username.toLowerCase()] = {
    username,
    type,
    reason: reason || "No reason provided",
    duration: duration || "Permanent",
    staff: staff || "Staff Team",
    details: details || "",
    bannedAt: new Date().toISOString(),
  };
  saveBans(bans);
  res.json({ success: true });
});

// Called by the admin dashboard when an appeal is approved
app.post("/api/unban", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Missing username" });

  const bans = loadBans();
  delete bans[username.toLowerCase()];
  saveBans(bans);
  res.json({ success: true });
});

// Called by the dashboard "Sync bans to game" button — pushes all active bans
app.post("/api/sync", (req, res) => {
  const { bans: banList } = req.body;
  const bans = {};
  for (const b of banList) {
    bans[b.roblox_username.toLowerCase()] = {
      username: b.roblox_username,
      type: b.moderation_type,
      reason: b.reason || "No reason provided",
      duration: b.duration || "Permanent",
      staff: b.staff_member || "Staff Team",
      details: b.details || "",
      bannedAt: b.moderation_date || new Date().toISOString(),
    };
  }
  saveBans(bans);
  res.json({ success: true, count: Object.keys(bans).length });
});

// Debug endpoint — lists all bans
app.get("/api/bans", (req, res) => {
  res.json(loadBans());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Escape Tsunami ban server running on port ${PORT}`));