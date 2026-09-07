// TestMandi API client — React Native port of testmandihome/src/api.js.
// Tokens live in SecureStore (async) but are mirrored in an in-memory cache
// so every request can read them synchronously; call hydrateTokens() once at
// startup (before rendering anything that calls the API) to load them in.
import * as SecureStore from './secureStorage';

export const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:4000';

const TOKEN_KEY = 'testmandi_token';
const REFRESH_KEY = 'testmandi_refresh';

let tokenCache: { token: string | null; refreshToken: string | null } = {
  token: null,
  refreshToken: null,
};
let hydrated = false;

export async function hydrateTokens() {
  if (hydrated) return tokenCache;
  const [token, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_KEY),
  ]);
  tokenCache = { token, refreshToken };
  hydrated = true;
  return tokenCache;
}

function getTokens() {
  return tokenCache;
}

async function setTokens({ token, refreshToken }: { token?: string; refreshToken?: string }) {
  if (token) {
    tokenCache.token = token;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
  if (refreshToken) {
    tokenCache.refreshToken = refreshToken;
    await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
  }
}

async function clearTokens() {
  tokenCache = { token: null, refreshToken: null };
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
  ]);
}

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions {
  method?: string;
  body?: any;
  auth?: boolean;
}

async function rawRequest(path: string, { method = 'GET', body, auth = true }: RequestOptions = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const { token } = getTokens();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  return { ok: res.ok, status: res.status, data };
}

async function tryRefresh(): Promise<boolean> {
  const { refreshToken } = getTokens();
  if (!refreshToken) return false;
  const { ok, data } = await rawRequest('/api/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
    auth: false,
  });
  if (ok && data?.token) {
    await setTokens({ token: data.token, refreshToken: data.refreshToken });
    return true;
  }
  await clearTokens();
  return false;
}

async function request(path: string, options: RequestOptions = {}) {
  let result = await rawRequest(path, options);
  if (result.status === 401 && options.auth !== false) {
    const refreshed = await tryRefresh();
    if (refreshed) result = await rawRequest(path, options);
  }
  if (!result.ok) {
    const message = result.data?.error || `Request failed (${result.status})`;
    throw new ApiError(message, result.status, result.data);
  }
  return result.data;
}

export const api = {
  baseUrl: API_BASE,
  hydrateTokens,
  isLoggedIn: () => !!getTokens().token,
  clearSession: clearTokens,

  // ---- auth ----
  register: (payload: any) =>
    request('/api/auth/register', { method: 'POST', body: payload, auth: false }).then(async (data) => {
      await setTokens(data);
      return data;
    }),
  login: (payload: any) =>
    request('/api/auth/login', { method: 'POST', body: payload, auth: false }).then(async (data) => {
      await setTokens(data);
      return data;
    }),
  logout: async () => {
    const { refreshToken } = getTokens();
    try {
      await rawRequest('/api/auth/logout', { method: 'POST', body: { refreshToken }, auth: false });
    } catch {
      /* best effort */
    }
    await clearTokens();
  },
  me: () => request('/api/auth/me'),
  updateAccount: (payload: any) =>
    request('/api/auth/update-account', { method: 'POST', body: payload }).then(async (data) => {
      await setTokens(data);
      return data;
    }),
  verifyEmail: (uid: string, token: string) =>
    request('/api/auth/verify-email', { method: 'POST', body: { uid, token }, auth: false }),
  resendVerification: () => request('/api/auth/resend-verification', { method: 'POST' }),
  forgotPassword: (email: string) =>
    request('/api/auth/forgot-password', { method: 'POST', body: { email }, auth: false }),
  resetPassword: (uid: string, token: string, newPassword: string) =>
    request('/api/auth/reset-password', { method: 'POST', body: { uid, token, newPassword }, auth: false }),

  // ---- categories ----
  getCategories: () => request('/api/categories', { auth: false }),

  // ---- tests ----
  getTests: () => request('/api/tests', { auth: false }),
  getMyTests: () => request('/api/tests/mine'),
  rateTest: (testId: string, value: number) =>
    request(`/api/tests/${testId}/rate`, { method: 'POST', body: { value } }),

  // ---- bundles ----
  getBundles: () => request('/api/bundles', { auth: false }),
  getMyBundlePurchases: () => request('/api/bundle-purchases/mine'),

  // ---- ads ----
  getActiveAds: () => request('/api/ads', { auth: false }),

  // ---- referrals ----
  getMyReferrals: () => request('/api/referrals/mine'),

  // ---- checkout (Razorpay) ----
  createOrder: (payload: any) => request('/api/checkout/create-order', { method: 'POST', body: payload }),
  verifyPayment: (payload: any) => request('/api/checkout/verify', { method: 'POST', body: payload }),
  getMyPurchases: () => request('/api/purchases/mine'),

  // ---- attempts ----
  submitAttempt: (payload: any) => request('/api/attempts', { method: 'POST', body: payload }),
  getMyAttempts: () => request('/api/attempts/mine'),

  // ---- seller payouts ----
  getMyPayouts: () => request('/api/payouts/mine'),
};
