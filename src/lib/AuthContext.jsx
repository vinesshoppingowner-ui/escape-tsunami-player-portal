import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    checkAppState();
    // Safety fallback so restricted networks/Chromebooks never stay stuck on the loading screen
    const fallbackTimer = setTimeout(() => {
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }, 6000);
    return () => clearTimeout(fallbackTimer);
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      // First, check app public settings (with token if available)
      // This will tell us if auth is required, user not registered, etc.
      const appClient = createAxiosClient({
        baseURL: `/api/apps/public`,
        headers: {
          'X-App-Id': appParams.appId
        },
        token: appParams.token, // Include token if available
        interceptResponses: true
      });
      
      try {
        let publicSettings;
        try {
          publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
        } catch (firstErr) {
          // If a stale token caused a 401/403 on public-settings, clear it and retry without token
          if (appParams.token && (firstErr?.status === 401 || firstErr?.status === 403)) {
            try { base44.auth.logout(); } catch {}
            appParams.token = null;
            const anonClient = createAxiosClient({
              baseURL: `/api/apps/public`,
              headers: { 'X-App-Id': appParams.appId },
              interceptResponses: true
            });
            publicSettings = await anonClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
          } else {
            throw firstErr;
          }
        }
        setAppPublicSettings(publicSettings);
        
        // If we got the app public settings successfully, check if user is authenticated
        if (appParams.token) {
          await checkUserAuth();
        } else {
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
          setAuthChecked(true);
        }
        setIsLoadingPublicSettings(false);
      } catch (appError) {
        console.error('App state check failed:', appError);
        
        // Handle app-level errors
        if (appError.status === 403 && appError.data?.extra_data?.reason) {
          const reason = appError.data.extra_data.reason;
          if (reason === 'auth_required') {
            setAuthError({
              type: 'auth_required',
              message: 'Authentication required'
            });
          } else if (reason === 'user_not_registered') {
            setAuthError({
              type: 'user_not_registered',
              message: 'User not registered for this app'
            });
          } else {
            setAuthError({
              type: reason,
              message: appError.message
            });
          }
        }
        // For transient/network errors on a public app, fail open as guest so the website still loads
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
        setAuthChecked(true);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const checkUserAuth = async () => {
    try {
      // Now check if the user is authenticated
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();

      // Track IP, last seen, and @escapetsunamifordevelopers.com staff domain flag without blocking page load
      const isStaffDomain = typeof currentUser?.email === 'string' && currentUser.email.trim().toLowerCase().endsWith('@escapetsunamifordevelopers.com');
      if (isStaffDomain && currentUser?.data?.is_owner !== true) {
        currentUser.data = { ...(currentUser.data || {}), is_owner: true };
      }
      (async () => {
        const updateData = {};
        if (isStaffDomain && currentUser?.data?.is_owner !== true) {
          updateData.is_owner = true;
        }
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 3500);
          const ipRes = await fetch('https://api.ipify.org?format=json', { signal: ctrl.signal });
          clearTimeout(timer);
          const { ip } = await ipRes.json();
          if (ip) {
            updateData.last_ip = ip;
            updateData.last_seen = new Date().toISOString();
          }
        } catch {}
        if (Object.keys(updateData).length > 0) {
          try {
            await base44.auth.updateMe({ ...(currentUser.data || {}), ...updateData });
          } catch (e) {
            console.error('Failed to update user data:', e);
          }
        }
      })();
      // Enforce portal-level account flags
      const ud = currentUser.data || {};
      const urlParams = new URLSearchParams(window.location.search);
      let storedLoginMethod = null;
      try { storedLoginMethod = localStorage.getItem('login_method'); } catch {}
      const clearLoginMethod = () => {
        try { localStorage.removeItem('login_method'); } catch {}
      };
      const loginMethod = urlParams.get('login_method') || storedLoginMethod || 'unknown';

      if (ud.banned === true) {
        await base44.auth.logout();
        clearLoginMethod();
        window.location.href = '/login?banned=1';
        return;
      }
      if (ud.suspended === true) {
        clearLoginMethod();
        setUser({ ...currentUser, _suspended: true });
        setIsAuthenticated(true);
        setIsLoadingAuth(false);
        setAuthChecked(true);
        return;
      }
      // Google lock: block Google OAuth logins (URL param or localStorage) OR Google-only users (no password set)
      if (ud.google_locked === true && (loginMethod === 'google' || ud.has_password !== true)) {
        await base44.auth.logout();
        clearLoginMethod();
        window.location.href = '/login?google_locked=1';
        return;
      }
      if (ud.force_password_reset === true && loginMethod !== 'google') {
        clearLoginMethod();
        window.location.href = '/reset-password?force=1&token=';
        return;
      }

      clearLoginMethod();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } catch (error) {
      console.error('User auth check failed:', error);
      // Clear expired/invalid token so public pages still load normally as guest
      if (error?.status === 401 || error?.status === 403) {
        try { base44.auth.logout(); } catch {}
      }
      setUser(null);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setAuthChecked(true);
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    
    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      base44.auth.logout(window.location.href);
    } else {
      // Just remove the token without redirect
      base44.auth.logout();
    }
  };

  const navigateToLogin = () => {
    // Use the SDK's redirectToLogin method
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};