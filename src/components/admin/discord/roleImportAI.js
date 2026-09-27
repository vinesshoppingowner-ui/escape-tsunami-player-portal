import { base44 } from '@/api/base44Client';
import { PERMISSIONS } from '@/components/admin/discord/discordPerms';

// Parses role changes from an image (file_urls) or pasted text
export async function parseRoleChanges(roleNames, { text, fileUrl }) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `The ${fileUrl ? 'attached image' : 'text below'} describes Discord role changes. Existing roles: ${roleNames.join(', ')}.
For each role mentioned return old_name (match exactly one existing role name), new_name (or same if unchanged), color_hex (#RRGGBB or empty if not given; convert color names to hex), and permissions (only if listed; use exact labels from: ${PERMISSIONS.map((p) => p[1]).join(', ')}; empty array if not mentioned).
Also follow any custom instructions: put existing role names the user asks to delete/remove in remove_names. If the user says to keep ONLY the listed roles (remove all others), set keep_only true and list every role to keep in changes.${text ? `\n\nTEXT:\n${text}` : ''}`,
    file_urls: fileUrl ? [fileUrl] : undefined,
    response_json_schema: { type: 'object', properties: { changes: { type: 'array', items: { type: 'object', properties: { old_name: { type: 'string' }, new_name: { type: 'string' }, color_hex: { type: 'string' }, permissions: { type: 'array', items: { type: 'string' } } } } }, remove_names: { type: 'array', items: { type: 'string' } }, keep_only: { type: 'boolean' } } },
  });
  return { changes: res.changes || [], remove_names: res.remove_names || [], keep_only: !!res.keep_only };
}