/**
 * authService.js
 *
 * Thin wrapper around AWS Amplify Auth (Cognito).
 *
 * In mock mode (no VITE_USER_POOL_ID set) every function resolves with
 * a fake user so the app is fully usable without AWS credentials.
 *
 * In production mode Amplify is configured from env vars set by Amplify
 * Hosting at build time:
 *   VITE_USER_POOL_ID        — Cognito User Pool ID
 *   VITE_USER_POOL_CLIENT_ID — Cognito App Client ID
 *   VITE_API_URL             — API Gateway base URL
 */

import { Amplify } from 'aws-amplify';
import {
  signIn,
  signUp,
  signOut,
  confirmSignUp,
  getCurrentUser,
  fetchAuthSession,
  resetPassword,
  confirmResetPassword,
} from 'aws-amplify/auth';

// ── Configure Amplify if env vars are present ─────────────────────────────────
const USER_POOL_ID        = import.meta.env.VITE_USER_POOL_ID;
const USER_POOL_CLIENT_ID = import.meta.env.VITE_USER_POOL_CLIENT_ID;
const USE_MOCK_AUTH       = !USER_POOL_ID || !USER_POOL_CLIENT_ID;

if (!USE_MOCK_AUTH) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId:       USER_POOL_ID,
        userPoolClientId: USER_POOL_CLIENT_ID,
      },
    },
  });
}

// ── Mock user for local development ──────────────────────────────────────────
const MOCK_USER = {
  userId:   'usr_98765',
  username: 'demo@plantapp.dev',
  email:    'demo@plantapp.dev',
};

function fakeDelay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Get the currently signed-in user, or null if not authenticated.
 * @returns {Promise<{ userId, username, email } | null>}
 */
export async function getCurrentAuthUser() {
  if (USE_MOCK_AUTH) {
    await fakeDelay(100);
    return MOCK_USER;
  }
  try {
    const user = await getCurrentUser();
    return {
      userId:   user.userId,
      username: user.username,
      email:    user.signInDetails?.loginId ?? user.username,
    };
  } catch {
    return null;
  }
}

/**
 * Get the current JWT access token for API calls.
 * Returns null in mock mode (API calls use the hardcoded mock userId).
 * @returns {Promise<string | null>}
 */
export async function getAccessToken() {
  if (USE_MOCK_AUTH) return null;
  try {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString() ?? null;
  } catch {
    return null;
  }
}

/**
 * Sign in with email + password.
 * @returns {Promise<{ userId, username, email }>}
 */
export async function login(email, password) {
  if (USE_MOCK_AUTH) {
    await fakeDelay(500);
    if (password.length < 6) throw new Error('Incorrect username or password');
    return MOCK_USER;
  }
  await signIn({ username: email, password });
  return getCurrentAuthUser();
}

/**
 * Register a new account.
 * @returns {Promise<{ nextStep: 'CONFIRM_SIGN_UP' | 'DONE' }>}
 */
export async function register(email, password) {
  if (USE_MOCK_AUTH) {
    await fakeDelay(500);
    return { nextStep: 'CONFIRM_SIGN_UP' };
  }
  const result = await signUp({
    username: email,
    password,
    options: { userAttributes: { email } },
  });
  return {
    nextStep: result.nextStep.signUpStep === 'CONFIRM_SIGN_UP'
      ? 'CONFIRM_SIGN_UP'
      : 'DONE',
  };
}

/**
 * Confirm registration with the code emailed by Cognito.
 */
export async function confirmRegistration(email, code) {
  if (USE_MOCK_AUTH) {
    await fakeDelay(400);
    return;
  }
  await confirmSignUp({ username: email, confirmationCode: code });
}

/**
 * Sign out the current user.
 */
export async function logout() {
  if (USE_MOCK_AUTH) {
    await fakeDelay(200);
    return;
  }
  await signOut();
}

/**
 * Initiate a password reset — sends a code to the user's email.
 */
export async function initiatePasswordReset(email) {
  if (USE_MOCK_AUTH) {
    await fakeDelay(400);
    return;
  }
  await resetPassword({ username: email });
}

/**
 * Complete a password reset with the emailed code.
 */
export async function completePasswordReset(email, code, newPassword) {
  if (USE_MOCK_AUTH) {
    await fakeDelay(400);
    return;
  }
  await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
}

export { USE_MOCK_AUTH };
