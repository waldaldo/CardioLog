// src/lib/drive.ts — Google Drive backup via OAuth2 + REST

import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { listReadings, getProfile, logBackup } from '../db/repositories';

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const SCOPES = ['https://www.googleapis.com/auth/drive.appdata'];
const DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint:         'https://oauth2.googleapis.com/token',
};

const TOKEN_KEY = 'drive_token';
const EMAIL_KEY = 'drive_email';

interface Token { access_token: string; refresh_token?: string; expires_at: number; }

async function getStoredToken(): Promise<Token | null> {
  const raw = await AsyncStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Token;
  } catch {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return null;
  }
}
async function storeToken(t: Token) { await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(t)); }

export async function connectedEmail(): Promise<string | null> {
  return AsyncStorage.getItem(EMAIL_KEY);
}

export async function signIn(): Promise<boolean> {
  if (!CLIENT_ID) throw new Error('Configura EXPO_PUBLIC_GOOGLE_CLIENT_ID en .env');
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'cardiolog' });

  const request = new AuthSession.AuthRequest({
    clientId: CLIENT_ID, scopes: SCOPES, redirectUri,
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
    extraParams: { access_type: 'offline', prompt: 'consent' },
  });
  const result = await request.promptAsync(DISCOVERY);
  if (result.type !== 'success') return false;

  const tokenRes = await AuthSession.exchangeCodeAsync({
    clientId: CLIENT_ID,
    code: result.params.code,
    redirectUri,
    extraParams: { code_verifier: request.codeVerifier! },
  }, DISCOVERY);

  const expires_at = Date.now() + (tokenRes.expiresIn ?? 3600) * 1000;
  await storeToken({
    access_token: tokenRes.accessToken,
    refresh_token: tokenRes.refreshToken,
    expires_at,
  });

  // Fetch user email
  const emailRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenRes.accessToken}` },
  });
  if (emailRes.ok) {
    const info = await emailRes.json();
    if (info.email) await AsyncStorage.setItem(EMAIL_KEY, info.email);
  }
  return true;
}

export async function signOut() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(EMAIL_KEY);
}

async function validAccessToken(): Promise<string | null> {
  if (!CLIENT_ID) return null;
  const t = await getStoredToken();
  if (!t) return null;
  if (Date.now() < t.expires_at - 60000) return t.access_token;
  if (!t.refresh_token) return null;
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    refresh_token: t.refresh_token,
    grant_type: 'refresh_token',
  });
  const refreshRes = await fetch(DISCOVERY.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!refreshRes.ok) return null;
  const r = await refreshRes.json();
  if (!r.access_token) return null;
  const next: Token = {
    access_token: r.access_token,
    refresh_token: t.refresh_token,
    expires_at: Date.now() + (r.expires_in ?? 3600) * 1000,
  };
  await storeToken(next);
  return next.access_token;
}

export async function backupNow(): Promise<{ fileId: string; count: number }> {
  const token = await validAccessToken();
  if (!token) throw new Error('Inicia sesión con Google primero');

  const profile = await getProfile();
  const readings = await listReadings(10000);
  const payload = {
    version: 1,
    exported_at: new Date().toISOString(),
    profile,
    readings,
  };

  const filename = `cardiolog-backup-${new Date().toISOString().slice(0,10)}.json`;
  const boundary = `boundary_${Math.random().toString(36).slice(2)}`;
  const metadata = { name: filename, parents: ['appDataFolder'], mimeType: 'application/json' };
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) +
    `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
    JSON.stringify(payload) +
    `\r\n--${boundary}--`;

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );
  if (!uploadRes.ok) {
    await logBackup(null, readings.length, 'error');
    throw new Error(`Drive upload failed (HTTP ${uploadRes.status})`);
  }
  const res = await uploadRes.json();

  if (!res.id) {
    await logBackup(null, readings.length, 'error');
    throw new Error('Drive upload failed: ' + JSON.stringify(res));
  }
  await logBackup(res.id, readings.length);
  return { fileId: res.id, count: readings.length };
}

export async function listDriveBackups() {
  const token = await validAccessToken();
  if (!token) return [];
  const listRes = await fetch(
    'https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name,modifiedTime,size)&orderBy=modifiedTime desc',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!listRes.ok) return [];
  const res = await listRes.json();
  return res.files ?? [];
}
