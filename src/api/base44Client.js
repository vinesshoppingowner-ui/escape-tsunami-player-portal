import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});

// Strip staff-only fields from player-created appeals so new appeals always start as Pending
const PLAYER_ALLOWED_APPEAL_FIELDS = [
  'moderation_id',
  'roblox_username',
  'appeal_reason',
  'why_accepted',
  'deserved_infraction',
  'unlisted_type',
  'unlisted_date',
  'unlisted_reason',
];

const sanitizeAppealCreatePayload = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  const clean = {};
  for (const key of PLAYER_ALLOWED_APPEAL_FIELDS) {
    if (payload[key] !== undefined) {
      clean[key] = payload[key];
    }
  }
  return clean;
};

if (base44?.entities?.Appeal) {
  const origCreate = base44.entities.Appeal.create.bind(base44.entities.Appeal);
  base44.entities.Appeal.create = (data, ...rest) => origCreate(sanitizeAppealCreatePayload(data), ...rest);
}