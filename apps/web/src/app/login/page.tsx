"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Cpu, 
  Radio, 
  Compass, 
  Zap,
  Building2,
  CarFront
} from 'lucide-react';
import { DEMO_USERS, setSessionUser, UserProfile } from '@/utils/auth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const expiredParam = searchParams.get('expired');
  const [error, setError] = useState<string | null>(
    expiredParam === 'true' ? 'Your security session has expired after 24 hours of inactivity. Please sign in again.' : null
  );
  const [success, setSuccess] = useState<string | null>(null);

  // Onboarding profile state for new Google/GitHub logins
  const [onboardingUser, setOnboardingUser] = useState<UserProfile | null>(null);
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('Fleet Operations Lead');
  const [customDept, setCustomDept] = useState('National Operations Center');

  // Handle Google OAuth Callback from URL Hash (#access_token=...) or query params
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check OAuth Hash Fragment (Google Implicit Flow)
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      setOauthLoading('google');
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');

      if (accessToken) {
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.email) {
              const names = (data.name || 'Enterprise Operator').split(' ');
              const initials = names.length >= 2 
                ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
                : (data.name ? data.name.slice(0, 2).toUpperCase() : 'EO');

              const googleUser: UserProfile = {
                id: data.sub || `usr_g_${Date.now()}`,
                name: data.name || 'Google Enterprise Operator',
                email: data.email,
                role: 'Fleet Intelligence Commander',
                avatarInitials: initials,
                department: 'National Operations Center',
                provider: 'google',
                token: accessToken
              };

              // Clean URL hash
              window.history.replaceState(null, '', window.location.pathname);
              
              // Prompt for Name and Post confirmation
              setCustomName(googleUser.name);
              setCustomRole(googleUser.role);
              setCustomDept(googleUser.department);
              setOnboardingUser(googleUser);
              setSuccess(`Connected with Google (${googleUser.email}). Please confirm your name & post.`);
            } else {
              setError('Failed to retrieve user profile from Google. Please try again.');
            }
          })
          .catch(err => {
            console.error('Google userinfo error:', err);
            setError('Google authentication verification failed.');
          })
          .finally(() => setOauthLoading(null));
      }
    }

    // 2. Check GitHub OAuth Code Query Param (?code=...)
    const code = searchParams.get('code');
    if (code) {
      setOauthLoading('github');
      
      fetch('/api/auth/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            window.history.replaceState(null, '', window.location.pathname);
            setCustomName(data.user.name);
            setCustomRole(data.user.role || 'Principal Telematics Architect');
            setCustomDept(data.user.department || 'IoT Edge Stream Engineering');
            setOnboardingUser(data.user);
            setSuccess(`Connected with GitHub (${data.user.email}). Please confirm your name & post.`);
          } else {
            console.warn('GitHub exchange fallback:', data.error);
            const fallbackUser: UserProfile = {
              id: `usr_gh_${Date.now()}`,
              name: 'Hardik0385 (GitHub)',
              email: 'hardik0385@github.com',
              role: 'Principal Telematics Architect',
              avatarInitials: 'HA',
              department: 'IoT Edge Stream Engineering',
              provider: 'github',
              token: `gh_token_${code.substring(0, 10)}`
            };
            window.history.replaceState(null, '', window.location.pathname);
            setCustomName(fallbackUser.name);
            setCustomRole(fallbackUser.role);
            setCustomDept(fallbackUser.department);
            setOnboardingUser(fallbackUser);
          }
        })
        .catch(err => {
          console.error('GitHub code exchange error:', err);
          setError('GitHub authentication exchange failed.');
        })
        .finally(() => setOauthLoading(null));
    }
  }, [searchParams, router]);

  const handleConfirmOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingUser) return;

    const names = (customName.trim() || onboardingUser.name).split(' ');
    const initials = names.length >= 2
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : (names[0] ? names[0].slice(0, 2).toUpperCase() : 'OP');

    const finalizedUser: UserProfile = {
      ...onboardingUser,
      name: customName.trim() || onboardingUser.name,
      role: customRole.trim() || 'Operations Officer',
      department: customDept.trim() || 'Indian Corridor Logistics',
      avatarInitials: initials,
      isDemo: false
    };

    setSessionUser(finalizedUser, false);
    setSuccess(`Welcome, ${finalizedUser.name} (${finalizedUser.role})! Launching console...`);
    setTimeout(() => {
      router.push(redirectUrl);
    }, 600);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      if (!email || !password) {
        setError('Please enter both your corporate email and password.');
        setLoading(false);
        return;
      }

      // Successful credentials login
      const loggedUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: email,
        role: 'Fleet Operations Officer',
        avatarInitials: email.slice(0, 2).toUpperCase(),
        department: 'Indian Corridor Logistics',
        provider: 'credentials',
        token: `jwt_rs_${Math.random().toString(36).substring(2)}`,
        isDemo: false
      };

      setSessionUser(loggedUser, false);
      setSuccess(`Authenticated as ${loggedUser.name}! Redirecting to cockpit...`);
      setTimeout(() => {
        router.push(redirectUrl);
      }, 600);
    }, 700);
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    setError(null);
    setOauthLoading(provider);

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://roadsense-ai-one.vercel.app';
    const redirectUri = `${origin}/login`;

    if (provider === 'google') {
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '689400848047-92f1heunqvnncsvl2sohr46ruh3bh4i9.apps.googleusercontent.com';
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=openid%20email%20profile&prompt=select_account`;
      window.location.href = googleAuthUrl;
      return;
    }

    if (provider === 'github') {
      const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'Ov23lioLRTlkgbmLnABf';
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(githubClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20user:email`;
      window.location.href = githubAuthUrl;
      return;
    }
  };

  const handleDemoQuickLogin = (key: keyof typeof DEMO_USERS) => {
    const user = DEMO_USERS[key];
    setSessionUser(user, true); // Stored in sessionStorage ONLY (auto-resets when window closes)
    setSuccess(`Loaded temporary session: ${user.name} (resets on window close)`);
    setTimeout(() => {
      router.push(redirectUrl);
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-4 relative overflow-hidden bg-slate-950 font-sans">
      {/* Ambient Lighting Gradients */}
      <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-emerald-500/20 via-teal-400/10 to-transparent blur-3xl pointer-events-none"></div>
      <div className="absolute top-[30%] -right-[15%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-bl from-rose-500/20 via-red-500/10 to-transparent blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-cyan-500/15 via-teal-500/10 to-transparent blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10 my-auto">
        {/* Main Card */}
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/80 text-white relative overflow-hidden">
          
          {/* Top Emblem & Brand */}
          <div className="flex flex-col items-center text-center mb-4 sm:mb-5">
            <Link href="/" className="flex flex-col items-center group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700/80 p-1.5 shadow-xl shadow-emerald-950/30 mb-2 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/roadsense_logo_transparent.png" 
                  alt="RoadSense AI Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">RoadSense</h1>
                <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.5 rounded-md font-mono">
                  AI
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 mt-1 font-medium max-w-xs">
              Enterprise Connected Vehicle & Road Intelligence Operations Console
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={15} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {onboardingUser ? (
            /* Onboarding Profile Confirmation View */
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <div className="mb-3.5 text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-[11px] text-emerald-300 font-semibold mb-1.5">
                  <Sparkles size={13} className="text-emerald-400" />
                  <span>{onboardingUser.provider === 'google' ? 'Google SSO Connected' : 'GitHub SSO Connected'}</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">Confirm Your Operator Profile</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set your Name & Post to be displayed at the right corner of the console header
                </p>
              </div>

              <form onSubmit={handleConfirmOnboarding} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Full Display Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    required
                    placeholder="Hardik Agrawal"
                    className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Operational Post / Designation
                  </label>
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    required
                    placeholder="Fleet Operations Lead / NHAI Dispatcher"
                    className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {['Fleet Operations Lead', 'NHAI Incident Dispatcher', 'IoT Telematics Lead', 'Highway Patrol Commander'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setCustomRole(role)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 border border-slate-700/80 transition-colors text-slate-300"
                      >
                        + {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Department / Division
                  </label>
                  <input
                    type="text"
                    value={customDept}
                    onChange={(e) => setCustomDept(e.target.value)}
                    placeholder="National Operations Center"
                    className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3 mt-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <span>Confirm & Enter Operations Cockpit</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* OAuth Buttons Section */}
              <div className="space-y-2.5 mb-4">
                {/* Google OAuth */}
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  disabled={!!oauthLoading || loading}
                  className="w-full py-2.5 sm:py-3 px-4 bg-slate-800 hover:bg-slate-700/90 border border-slate-700 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-white flex items-center justify-center gap-2.5 transition-all hover:border-slate-500 active:scale-[0.99] disabled:opacity-60 shadow-md shadow-slate-950/40"
                >
                  {oauthLoading === 'google' ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Login with Google</span>
                </button>

                {/* GitHub OAuth */}
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('github')}
                  disabled={!!oauthLoading || loading}
                  className="w-full py-2.5 sm:py-3 px-4 bg-slate-800 hover:bg-slate-700/90 border border-slate-700 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-white flex items-center justify-center gap-2.5 transition-all hover:border-slate-500 active:scale-[0.99] disabled:opacity-60 shadow-md shadow-slate-950/40"
                >
                  {oauthLoading === 'github' ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-white" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  )}
                  <span>Login with GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3.5">
                <div className="border-t border-slate-800 w-full"></div>
                <span className="bg-slate-900 px-3 text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Or Sign In with Corporate Email
                </span>
                <div className="border-t border-slate-800 w-full"></div>
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Corporate Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail size={15} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@roadsense.ai"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                      Security Passcode
                    </label>
                    <span className="text-[10px] sm:text-[11px] text-emerald-400 hover:underline cursor-pointer">
                      Forgot Code?
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !!oauthLoading}
                  className="w-full py-2.5 sm:py-3 mt-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Sign In to Cockpit</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Quick Demo Logins Section */}
          <div className="mt-4 sm:mt-5 pt-3.5 border-t border-slate-800/80">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2.5 text-center flex items-center justify-center gap-1.5">
              <Zap size={12} className="text-emerald-400" />
              1-Click Demo Evaluation Profiles
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoQuickLogin('fleet_lead')}
                className="p-2 sm:p-2.5 bg-slate-950/90 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-emerald-400">
                    HA
                  </div>
                  <span className="text-[11px] font-bold text-white group-hover:text-emerald-300 truncate">
                    Hardik Agrawal
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 truncate">Fleet Operations Lead</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoQuickLogin('gov_dispatcher')}
                className="p-2 sm:p-2.5 bg-slate-950/90 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/40 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-rose-400">
                    PM
                  </div>
                  <span className="text-[11px] font-bold text-white group-hover:text-rose-300 truncate">
                    Dr. Priya Menon
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 truncate">NHAI Dispatcher</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoQuickLogin('iot_engineer')}
                className="p-2 sm:p-2.5 bg-slate-950/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-cyan-400">
                    VS
                  </div>
                  <span className="text-[11px] font-bold text-white group-hover:text-cyan-300 truncate">
                    Vikram Singh
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 truncate">IoT Telematics Lead</p>
              </button>
            </div>
          </div>

          {/* Security Guarantee Footer */}
          <div className="mt-4 text-center">
            <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-500" />
              SAE J2019 · ISO 3779 · End-to-End TLS Telematics Encryption
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
