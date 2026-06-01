/**
 * AuthGate
 *
 * Full-page auth flow: Sign In → Sign Up → Confirm email → Forgot password.
 * Wraps the entire app — children only render when the user is authenticated.
 *
 * Props:
 *   children - rendered when authenticated
 */

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { USE_MOCK_AUTH, initiatePasswordReset, completePasswordReset } from '../services/authService';

// ── Shared input component ────────────────────────────────────────────────────
function Field({ id, label, type = 'text', value, onChange, autoComplete, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm
                   focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-transparent
                   placeholder:text-gray-300"
        required
      />
    </div>
  );
}

// ── Error banner ──────────────────────────────────────────────────────────────
function ErrorBanner({ error, onDismiss }) {
  if (!error) return null;
  return (
    <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-start justify-between gap-2">
      <span>{error.message}</span>
      <button onClick={onDismiss} className="text-red-400 hover:text-red-600 flex-shrink-0" aria-label="Dismiss error">×</button>
    </div>
  );
}

// ── Sign In form ──────────────────────────────────────────────────────────────
function SignInForm({ onSuccess, onRegister, onForgot, authError, clearError, authLoading }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      onSuccess();
    } catch { /* error shown via authError */ }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorBanner error={authError} onDismiss={clearError} />
      <Field id="signin-email"    label="Email"    type="email"    value={email}    onChange={(e) => setEmail(e.target.value)}    autoComplete="email"            placeholder="you@example.com" />
      <Field id="signin-password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" />

      <button
        type="submit"
        disabled={authLoading}
        className="w-full py-2.5 rounded-xl bg-leaf-600 text-white text-sm font-semibold
                   hover:bg-leaf-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {authLoading ? 'Signing in…' : 'Sign in'}
      </button>

      <div className="flex justify-between text-xs text-gray-400 pt-1">
        <button type="button" onClick={onForgot}    className="hover:text-leaf-600 transition-colors">Forgot password?</button>
        <button type="button" onClick={onRegister}  className="hover:text-leaf-600 transition-colors">Create account →</button>
      </div>
    </form>
  );
}

// ── Sign Up form ──────────────────────────────────────────────────────────────
function SignUpForm({ onConfirmNeeded, onSignIn, authError, clearError, authLoading }) {
  const { register } = useAuth();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [localError, setLocalError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);
    if (password !== confirm) {
      setLocalError(new Error('Passwords do not match'));
      return;
    }
    if (password.length < 8) {
      setLocalError(new Error('Password must be at least 8 characters'));
      return;
    }
    try {
      const result = await register(email, password);
      onConfirmNeeded(email);
    } catch { /* shown via authError */ }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorBanner error={localError ?? authError} onDismiss={() => { setLocalError(null); clearError(); }} />
      <Field id="signup-email"    label="Email"            type="email"    value={email}    onChange={(e) => setEmail(e.target.value)}    autoComplete="email"            placeholder="you@example.com" />
      <Field id="signup-password" label="Password"         type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password"     placeholder="Min. 8 characters" />
      <Field id="signup-confirm"  label="Confirm password" type="password" value={confirm}  onChange={(e) => setConfirm(e.target.value)}  autoComplete="new-password"     placeholder="••••••••" />

      <button
        type="submit"
        disabled={authLoading}
        className="w-full py-2.5 rounded-xl bg-leaf-600 text-white text-sm font-semibold
                   hover:bg-leaf-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {authLoading ? 'Creating account…' : 'Create account'}
      </button>

      <p className="text-center text-xs text-gray-400">
        Already have an account?{' '}
        <button type="button" onClick={onSignIn} className="text-leaf-600 hover:underline">Sign in</button>
      </p>
    </form>
  );
}

// ── Confirm email form ────────────────────────────────────────────────────────
function ConfirmForm({ email, onSuccess, authError, clearError, authLoading }) {
  const { confirmSignUp, login } = useAuth();
  const [code, setCode]           = useState('');
  const [password, setPassword]   = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await confirmSignUp(email, code);
      await login(email, password);
      onSuccess();
    } catch { /* shown via authError */ }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-gray-500 bg-leaf-50 rounded-lg px-3 py-2">
        A confirmation code was sent to <strong>{email}</strong>. Enter it below to activate your account.
      </p>
      <ErrorBanner error={authError} onDismiss={clearError} />
      <Field id="confirm-code"     label="Confirmation code" value={code}     onChange={(e) => setCode(e.target.value)}     placeholder="123456" />
      <Field id="confirm-password" label="Your password"     type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" />

      <button
        type="submit"
        disabled={authLoading}
        className="w-full py-2.5 rounded-xl bg-leaf-600 text-white text-sm font-semibold
                   hover:bg-leaf-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {authLoading ? 'Confirming…' : 'Confirm & sign in'}
      </button>
    </form>
  );
}

// ── Forgot password form ──────────────────────────────────────────────────────
function ForgotForm({ onSignIn, authError, clearError, authLoading }) {
  const [email, setEmail]   = useState('');
  const [code, setCode]     = useState('');
  const [newPw, setNewPw]   = useState('');
  const [sent, setSent]     = useState(false);
  const [done, setDone]     = useState(false);
  const { initiateReset, completeReset } = { initiateReset: null, completeReset: null }; // wired below

  // Import directly since useAuth doesn't expose these yet
  const [localError, setLocalError] = useState(null);

  async function handleSend(e) {
    e.preventDefault();
    setLocalError(null);
    try {
      const { initiatePasswordReset } = await import('../services/authService');
      await initiatePasswordReset(email);
      setSent(true);
    } catch (err) { setLocalError(err); }
  }

  async function handleReset(e) {
    e.preventDefault();
    setLocalError(null);
    try {
      const { completePasswordReset } = await import('../services/authService');
      await completePasswordReset(email, code, newPw);
      setDone(true);
    } catch (err) { setLocalError(err); }
  }
  if (done) {
    return (
      <div className="text-center space-y-4">
        <span className="text-4xl block">✅</span>
        <p className="text-sm text-gray-600">Password reset successfully.</p>
        <button onClick={onSignIn} className="text-leaf-600 text-sm hover:underline">Sign in with new password →</button>
      </div>
    );
  }

  return (
    <form onSubmit={sent ? handleReset : handleSend} className="space-y-4">
      <ErrorBanner error={localError ?? authError} onDismiss={() => { setLocalError(null); clearError(); }} />
      <Field id="forgot-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" />
      {sent && (
        <>
          <Field id="forgot-code"  label="Reset code (check your email)" value={code}  onChange={(e) => setCode(e.target.value)}  placeholder="123456" />
          <Field id="forgot-newpw" label="New password" type="password"  value={newPw} onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" placeholder="Min. 8 characters" />
        </>
      )}
      <button
        type="submit"
        disabled={authLoading}
        className="w-full py-2.5 rounded-xl bg-leaf-600 text-white text-sm font-semibold
                   hover:bg-leaf-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sent ? 'Reset password' : 'Send reset code'}
      </button>
      <p className="text-center text-xs text-gray-400">
        <button type="button" onClick={onSignIn} className="text-leaf-600 hover:underline">Back to sign in</button>
      </p>
    </form>
  );
}

// ── AuthGate shell ────────────────────────────────────────────────────────────
export default function AuthGate({ children }) {
  const { isAuthenticated, authLoading, authError, clearError } = useAuth();
  const [view, setView]           = useState('signin'); // signin | signup | confirm | forgot
  const [confirmEmail, setConfirmEmail] = useState('');

  // Initial session check
  if (authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-leaf-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-leaf-600">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm font-medium">Loading…</span>
        </div>
      </div>
    );
  }

  // Authenticated — render the app
  if (isAuthenticated) return children;

  // Auth forms
  return (
    <div className="min-h-screen bg-leaf-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3" aria-hidden="true">🌱</span>
          <h1 className="text-2xl font-bold text-leaf-800">PlantApp</h1>
          <p className="text-sm text-gray-400 mt-1">Your personal garden care planner</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md border border-leaf-100 p-6">

          {/* Mock mode notice */}
          {USE_MOCK_AUTH && (
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
              <strong>Dev mode:</strong> any email + password (6+ chars) will sign you in.
            </div>
          )}

          {/* Form title */}
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            {{ signin: 'Sign in', signup: 'Create account', confirm: 'Confirm email', forgot: 'Reset password' }[view]}
          </h2>

          {view === 'signin' && (
            <SignInForm
              onSuccess={() => {}}
              onRegister={() => { clearError(); setView('signup'); }}
              onForgot={() => { clearError(); setView('forgot'); }}
              authError={authError}
              clearError={clearError}
              authLoading={authLoading}
            />
          )}
          {view === 'signup' && (
            <SignUpForm
              onConfirmNeeded={(email) => { setConfirmEmail(email); setView('confirm'); }}
              onSignIn={() => { clearError(); setView('signin'); }}
              authError={authError}
              clearError={clearError}
              authLoading={authLoading}
            />
          )}
          {view === 'confirm' && (
            <ConfirmForm
              email={confirmEmail}
              onSuccess={() => {}}
              authError={authError}
              clearError={clearError}
              authLoading={authLoading}
            />
          )}
          {view === 'forgot' && (
            <ForgotForm
              onSignIn={() => { clearError(); setView('signin'); }}
              authError={authError}
              clearError={clearError}
              authLoading={authLoading}
            />
          )}
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          PlantApp · {new Date().getFullYear()} · Built on AWS
        </p>
      </div>
    </div>
  );
}
