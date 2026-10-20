import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const HEADERS = [
  'Response ID',
  'Application',
  'Roblox Username',
  'Email',
  'Submitted At',
  'Status',
  'Attempt',
  'Reviewed By',
  'Reviewed At',
];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { response_id } = body;

    if (!response_id) return Response.json({ error: 'Missing response_id' }, { status: 400 });

    // Load sync settings
    const settingsPage = await base44.asServiceRole.entities.SiteSettings.list('-updated_date', 1);
    const settings = settingsPage?.[0];
    if (!settings || !settings.sheet_sync_enabled || !settings.sheet_sync_spreadsheet_id) {
      return Response.json({ ok: true, skipped: true, reason: 'Sheet sync not configured' });
    }

    // Load the application response
    const response = await base44.asServiceRole.entities.ApplicationResponse.get(response_id);
    if (!response) return Response.json({ error: 'Response not found' }, { status: 404 });

    const spreadsheetId = extractSpreadsheetId(settings.sheet_sync_spreadsheet_id);
    const tabName = (settings.sheet_sync_tab_name || 'Applications').trim() || 'Applications';

    // Get the owner's Google Sheets token
    let accessToken;
    try {
      ({ accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets'));
    } catch {
      return Response.json({ ok: false, error: 'Google Sheets is not connected. The owner must connect their Google account.' }, { status: 503 });
    }

    const authHeader = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
    const sheetBase = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;

    // Ensure the tab exists
    await ensureTab(sheetBase, tabName, authHeader);

    // Ensure headers exist in row 1
    const headerRes = await fetch(`${sheetBase}/values/${encodeURIComponent(tabName)}!A1:I1`, { headers: authHeader });
    const headerData = await headerRes.json();
    if (!headerData.values?.[0] || headerData.values[0][0] !== HEADERS[0]) {
      await fetch(`${sheetBase}/values/${encodeURIComponent(tabName)}!A1:append?insertDataOption=OVERWRITE&valueInputOption=RAW`, {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({ values: [HEADERS] }),
      });
    }

    // Build the row
    const row = [
      response.id,
      response.application_title || '',
      response.roblox_username || '',
      response.submitted_by_email || '',
      response.created_date || '',
      response.status || 'submitted',
      String(response.attempt || 1),
      response.reviewed_by || '',
      response.reviewed_at || '',
    ];

    // Find existing row by Response ID (column A)
    const idColRes = await fetch(`${sheetBase}/values/${encodeURIComponent(tabName)}!A:A`, { headers: authHeader });
    const idData = await idColRes.json();
    const ids = idData.values || [];
    let rowNum = -1;
    for (let i = 1; i < ids.length; i++) {
      if (ids[i]?.[0] === response.id) { rowNum = i + 1; break; }
    }

    if (rowNum === -1) {
      // Append new row
      const appendRes = await fetch(`${sheetBase}/values/${encodeURIComponent(tabName)}!A:append?valueInputOption=RAW`, {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({ values: [row] }),
      });
      if (!appendRes.ok) {
        const err = await appendRes.json().catch(() => ({}));
        return Response.json({ ok: false, error: err.error?.message || 'Failed to append row' }, { status: 502 });
      }
    } else {
      // Update existing row
      const updateRes = await fetch(`${sheetBase}/values/${encodeURIComponent(tabName)}!A${rowNum}:I${rowNum}?valueInputOption=RAW`, {
        method: 'PUT',
        headers: authHeader,
        body: JSON.stringify({ values: [row] }),
      });
      if (!updateRes.ok) {
        const err = await updateRes.json().catch(() => ({}));
        return Response.json({ ok: false, error: err.error?.message || 'Failed to update row' }, { status: 502 });
      }
    }

    return Response.json({ ok: true, rowNum: rowNum === -1 ? 'appended' : rowNum });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function extractSpreadsheetId(input) {
  if (!input) return '';
  const s = String(input).trim();
  // Full Google Sheets URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
  const match = s.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  return s;
}

async function ensureTab(sheetBase, tabName, authHeader) {
  // Try reading A1 — if it fails, the tab doesn't exist
  const res = await fetch(`${sheetBase}/values/${encodeURIComponent(tabName)}!A1`, { headers: authHeader });
  if (res.ok) return;
  // Create the tab
  await fetch(`${sheetBase}:batchUpdate`, {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: tabName } } }] }),
  });
}