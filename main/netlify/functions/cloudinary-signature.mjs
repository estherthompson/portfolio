import { createHash, randomUUID } from 'node:crypto';

const allowedTypes = {
  image: new Set(['webp']),
  video: new Set(['mp4', 'webm', 'mov']),
  raw: new Set(['pdf']),
};

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
  },
  body: JSON.stringify(body),
});

function getBearerToken(event) {
  const header = event.headers?.authorization || event.headers?.Authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || '';
}

function decodeTokenPayload(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

async function verifyJournalAdmin(idToken, apiKey, adminUid) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return false;

  const result = await response.json();
  const user = result.users?.[0];
  if (!user || user.localId !== adminUid || user.disabled) return false;

  // Firebase validates the token above. Check auth_time against validSince too,
  // so an account-disabled/revoked token cannot receive new upload signatures.
  const claims = decodeTokenPayload(idToken);
  const authTime = Number(claims?.auth_time);
  const validSince = Number(user.validSince || 0);
  return Number.isFinite(authTime) && (validSince === 0 || authTime > validSince);
}

function createCloudinarySignature(parameters, apiSecret) {
  const serialized = Object.entries(parameters)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return createHash('sha1').update(`${serialized}${apiSecret}`).digest('hex');
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  const idToken = getBearerToken(event);
  if (!idToken || idToken.length > 12_000) {
    return json(401, { error: 'Sign in again as the journal admin to upload files.' });
  }

  let request;
  try {
    if (!event.body || event.body.length > 1024) return json(400, { error: 'Invalid upload request.' });
    request = JSON.parse(event.body);
  } catch {
    return json(400, { error: 'Invalid upload request.' });
  }

  const resourceType = request.resourceType;
  const extension = String(request.extension || '').toLowerCase();
  if (!allowedTypes[resourceType]?.has(extension)) {
    return json(400, { error: 'This file type is not allowed.' });
  }

  const {
    CLOUDINARY_CLOUD_NAME: cloudName,
    CLOUDINARY_API_KEY: apiKey,
    CLOUDINARY_API_SECRET: apiSecret,
    FIREBASE_WEB_API_KEY: firebaseWebApiKey,
    JOURNAL_ADMIN_UID: adminUid,
  } = process.env;
  if (!cloudName || !apiKey || !apiSecret || !firebaseWebApiKey || !adminUid) {
    return json(500, { error: 'Secure uploads are not configured on the server.' });
  }

  try {
    if (!(await verifyJournalAdmin(idToken, firebaseWebApiKey, adminUid))) {
      return json(403, { error: 'Only the signed-in journal admin can upload files.' });
    }
  } catch {
    return json(503, { error: 'Admin access could not be verified. Please try again.' });
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const publicId = `${randomUUID()}${resourceType === 'raw' ? `.${extension}` : ''}`;
  const parameters = {
    folder: 'nonsense-ingredients',
    overwrite: 'false',
    public_id: publicId,
    timestamp,
  };

  return json(200, {
    cloudName,
    apiKey,
    resourceType,
    parameters,
    signature: createCloudinarySignature(parameters, apiSecret),
  });
}
