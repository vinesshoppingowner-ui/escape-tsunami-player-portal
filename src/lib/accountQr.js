/**
 * Members can generate a personal code in Settings that staff scan on the staff
 * website. It carries nothing but the Portal Account ID — every detail is looked
 * up server-side, so the code itself is harmless if someone photographs it.
 *
 * Format:  etsu-acct:<portal account id>
 * Staff-side scanners should also accept a bare 24-char id, or a link with
 * ?acct=<id> / ?account_id=<id>.
 */
export const ACCOUNT_QR_PREFIX = 'etsu-acct:';

export function buildAccountQrPayload(accountId) {
  return accountId ? `${ACCOUNT_QR_PREFIX}${accountId}` : '';
}