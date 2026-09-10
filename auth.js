/**
 * ============================================================================
 * GOOGLE IDENTITY SERVICES (GIS) / OAUTH 2.0 AUTHENTICATION MANAGER
 * ============================================================================
 * 
 * SETUP INSTRUCTIONS FOR GOOGLE CLOUD CONSOLE:
 * 1. Visit Google Cloud Console: https://console.cloud.google.com/apis/credentials
 * 2. Create a project (or select an existing one) and configure the "OAuth Consent Screen".
 * 3. Go to "Credentials" -> "Create Credentials" -> "OAuth client ID".
 * 4. Application type: "Web application".
 * 5. Under "Authorized JavaScript origins", add exact origin URLs WITHOUT trailing slashes:
 *    - http://localhost
 *    - http://localhost:8080
 *    - http://127.0.0.1:5500
 *    - https://<your-project>.vercel.app (e.g. your active Vercel domain)
 * 6. Under "Authorized redirect URIs", add:
 *    - https://<your-project>.vercel.app
 * 7. Copy your Client ID and replace GOOGLE_CLIENT_ID below.
 * 
 * NOTE: If Google Sign-In encounters domain mismatch, popup blocker, or cancellation,
 * the Callsign / Guest login fallback inside the modal is always active and unblocked.
 */

const GOOGLE_CLIENT_ID = '1021532607267-3bggltjfaaesvrhdkh6adllfaf2bv42m.apps.googleusercontent.com'; // <-- NEW CLIENT ID

// Safe Console logger interceptor for [GSI_LOGGER] origin, status 400, and 403 Forbidden errors
let _inLoggerInterceptor = false;
if (typeof console !== 'undefined' && !console._gisOriginLoggerBound) {
  console._gisOriginLoggerBound = true;
  const _origConsoleError = console.error;
  const _origConsoleWarn = console.warn;
  console.error = function(...args) {
    try {
      if (!_inLoggerInterceptor) {
        _inLoggerInterceptor = true;
        const combined = args.map(a => (a && typeof a === 'object' ? (a.message || (typeof a.toString === 'function' ? a.toString() : '')) : String(a))).join(' ');
        if (/\[GSI_LOGGER\]|accounts\.google\.com|googleapis\.com/i.test(combined)) {
          if (/403|access_denied|forbidden/i.test(combined)) {
            if (window.AuthManager && typeof window.AuthManager.handleAuth403 === 'function') {
              window.AuthManager.handleAuth403(combined);
            }
            _inLoggerInterceptor = false;
            return;
          }
          if (/origin/i.test(combined) || /400/i.test(combined) || /not allowed/i.test(combined)) {
            if (window.AuthManager && !window.AuthManager.isOriginMismatch && typeof window.AuthManager.handleOriginMismatch === 'function') {
              window.AuthManager.handleOriginMismatch(combined);
            }
            _inLoggerInterceptor = false;
            return;
          }
        }
        _inLoggerInterceptor = false;
      }
    } catch (e) {
      _inLoggerInterceptor = false;
    }
    _origConsoleError.apply(console, args);
  };
  console.warn = function(...args) {
    try {
      if (!_inLoggerInterceptor) {
        _inLoggerInterceptor = true;
        const combined = args.map(a => (a && typeof a === 'object' ? (a.message || (typeof a.toString === 'function' ? a.toString() : '')) : String(a))).join(' ');
        if (/\[GSI_LOGGER\]|accounts\.google\.com|googleapis\.com/i.test(combined)) {
          if (/403|access_denied|forbidden/i.test(combined)) {
            if (window.AuthManager && typeof window.AuthManager.handleAuth403 === 'function') {
              window.AuthManager.handleAuth403(combined);
            }
            _inLoggerInterceptor = false;
            return;
          }
          if (/origin/i.test(combined) || /400/i.test(combined) || /not allowed/i.test(combined)) {
            if (window.AuthManager && !window.AuthManager.isOriginMismatch && typeof window.AuthManager.handleOriginMismatch === 'function') {
              window.AuthManager.handleOriginMismatch(combined);
            }
            _inLoggerInterceptor = false;
            return;
          }
        }
        _inLoggerInterceptor = false;
      }
    } catch (e) {
      _inLoggerInterceptor = false;
    }
    _origConsoleWarn.apply(console, args);
  };
}

class AuthManager {
  constructor() {
    this.clientId = GOOGLE_CLIENT_ID;
    this.isGisLoaded = false;
    this.isOriginMismatch = false;
    this._isHandlingMismatch = false;
    this._isHandling403 = false;
    this._originMismatchRendered = false;

    // Check if current origin was previously detected as unauthorized for this specific client ID
    try {
      if (typeof sessionStorage !== 'undefined' && typeof window !== 'undefined' && window.location?.origin) {
        if (sessionStorage.getItem('cyber_gis_mismatch_client_id') === this.clientId &&
            sessionStorage.getItem('cyber_gis_origin_mismatch') === window.location.origin) {
          this.isOriginMismatch = true;
        } else {
          sessionStorage.removeItem('cyber_gis_origin_mismatch');
          sessionStorage.removeItem('cyber_gis_mismatch_client_id');
        }
      }
    } catch (e) {}

    this.currentUser = null;
    this.tokenClient = null;

    this.init();
  }

  /**
   * Log active origin and alert if trailing slash exists or on Vercel
   */
  logOriginStatus() {
    if (typeof window !== 'undefined' && window.location) {
      try {
        const origin = window.location.origin;
        if (origin && origin.includes('vercel.app')) {
          console.info(`[AuthManager] Active Vercel domain: "${origin}". Ensure "${origin}" (without trailing slash) is registered in Google Cloud Console -> Credentials -> OAuth 2.0 Client IDs -> Authorized JavaScript origins.`);
        }
      } catch (e) {}
    }
  }

  /**
   * Check whether a real Client ID has been configured
   */
  isConfigured() {
    return this.clientId && !this.clientId.includes('YOUR_GOOGLE_CLIENT_ID');
  }

  /**
   * Initialize Google Identity Services SDK (completely non-blocking)
   */
  init() {
    // Load any existing cached session immediately (synchronous, 0ms)
    this.loadSavedUser();

    // If no authenticated user exists, immediately continue in guest mode so game features and presence do not hang
    if (!this.currentUser) {
      this.continueInGuestMode();
    }

    // Make GIS initialization completely non-blocking and asynchronous.
    // Defer GIS setup so constructor finishes immediately, allowing script.js,
    // lobby rendering, and game loop to proceed with zero wait time.
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.initGisAsync();
      }, 0);

      if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => this.bindModalControls());
        } else {
          this.bindModalControls();
        }
      }
    }
  }

  /**
   * Continue execution immediately in guest mode so game features, lobbies, and presence do not hang
   */
  continueInGuestMode() {
    try {
      console.info('[AuthManager] GIS deferred or unavailable. Continuing execution immediately in guest mode so game features and presence do not hang.');
      if (window.gameInstance && typeof window.gameInstance.ensureGameLoopRunning === 'function') {
        try { window.gameInstance.ensureGameLoopRunning(); } catch (e) {}
      }
    } catch (e) {}
  }

  /**
   * Non-blocking asynchronous GIS initialization & script detection
   */
  initGisAsync() {
    try {
      if (this.isGisLoaded) return;

      // Wrap in a check to ensure window.google?.accounts?.id exists before calling initialize
      if (typeof window !== 'undefined' && window.google?.accounts?.id && typeof window.google.accounts.id.initialize === 'function') {
        this.setupGis();
        return;
      }

      // If GIS script hasn't finished loading yet, continue in guest mode and poll briefly in background
      this.continueInGuestMode();

      // If GIS script hasn't finished loading yet, poll asynchronously without blocking execution
      let attempts = 0;
      const maxAttempts = 10; // 10 * 200ms = 2.0s maximum
      const pollInterval = setInterval(() => {
        attempts++;
        try {
          if (typeof window !== 'undefined' && window.google?.accounts?.id && typeof window.google.accounts.id.initialize === 'function') {
            clearInterval(pollInterval);
            this.setupGis();
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            console.warn('[AuthManager] Google Identity Services script load timed out or is blocked by adblocker/browser security. Continuing execution immediately in guest mode.');
            this.continueInGuestMode();
            this.resetSignInButtonState();
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          console.warn('[AuthManager] Non-blocking GIS poll caught exception. Continuing in guest mode:', pollErr);
          this.continueInGuestMode();
          this.resetSignInButtonState();
        }
      }, 200);
    } catch (err) {
      console.warn('[AuthManager] Non-blocking async GIS init error. Continuing in guest mode:', err);
      this.continueInGuestMode();
      this.resetSignInButtonState();
    }
  }

  /**
   * Configure Google Identity Services client & render button (completely non-blocking)
   */
  setupGis() {
    if (this.isGisLoaded) return;

    // Wrap in a check to ensure window.google?.accounts?.id exists before calling initialize
    if (typeof window === 'undefined' || !window.google?.accounts?.id || typeof window.google.accounts.id.initialize !== 'function') {
      console.warn('[AuthManager] Google Identity Services (window.google?.accounts?.id) is not available or blocked by adblocker/browser security. Continuing execution immediately in guest mode.');
      this.continueInGuestMode();
      this.resetSignInButtonState();
      return;
    }

    this.isGisLoaded = true;
    console.log('[AuthManager] Initializing Google Identity Services (non-blocking)...');
    this.logOriginStatus();

    try {
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response) => {
          try {
            this.handleCredentialResponse(response);
          } catch (cbErr) {
            console.warn('[AuthManager] Exception in GIS credential callback:', cbErr);
            this.handleAuthError('Google Sign-In encountered an error. Enter a Callsign below or click Continue to play as Guest.');
          }
        },
        error_callback: (err) => {
          console.warn('[AuthManager] GIS initialization/error callback notice:', err);
          const errType = (err && (err.type || err.message || err.status || (typeof err === 'object' ? JSON.stringify(err) : String(err)))) ? String(err.type || err.message || err.status || JSON.stringify(err)) : '';
          if (/403|access_denied|forbidden/i.test(errType)) {
            this.handleAuth403(errType);
            return;
          }
          if (/origin|400|not allowed|misconfigured|mismatch|gsi_logger/i.test(errType)) {
            this.handleOriginMismatch(errType);
            return;
          }
          let msg = 'Google Sign-In unavailable on this domain. Enter a Callsign below or click Continue to play as Guest.';
          if (errType.includes('popup_closed') || errType.includes('user_cancel')) {
            msg = 'Google Sign-In popup closed. Enter a Callsign below or click Continue to play as Guest.';
          }
          this.handleAuthError(msg);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin'
      });

      // Render official Google button if container exists
      this.renderGisButton();
      // Initialize OAuth 2.0 token client for custom button click
      this.initTokenClient();
    } catch (err) {
      console.warn('[AuthManager] Google Identity Services initialization failed or was blocked by browser security. Continuing execution immediately in guest mode:', err);
      this.continueInGuestMode();
      const errStr = String(err?.message || err || '');
      if (/origin|400|not allowed|misconfigured|mismatch|gsi_logger/i.test(errStr)) {
        this.handleOriginMismatch(errStr);
      } else {
        this.handleAuthError('Google Sign-In unavailable on this domain or blocked by adblocker. Enter a Callsign below or click Continue to play as Guest.');
      }
    } finally {
      this.resetSignInButtonState();
      if (window.gameInstance && typeof window.gameInstance.ensureGameLoopRunning === 'function') {
        try { window.gameInstance.ensureGameLoopRunning(); } catch (e) {}
      }
    }
  }

  /**
   * Render the official Google Sign-In Button into #g_id_signin_container
   */
  renderGisButton() {
    if (this.isOriginMismatch) {
      this.showOriginMismatchUI();
      return;
    }
    const container = document.getElementById('g_id_signin_container');
    if (!container || !window.google?.accounts?.id || typeof window.google.accounts.id.renderButton !== 'function') return;

    // Clear prior content
    container.innerHTML = '';

    try {
      window.google.accounts.id.renderButton(container, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        logo_alignment: 'left',
        width: 280
      });
    } catch (e) {
      console.warn('[AuthManager] Could not render GIS button widget:', e);
      const errStr = String(e?.message || e || '');
      if (/origin|400|not allowed|misconfigured|mismatch|gsi_logger/i.test(errStr)) {
        this.handleOriginMismatch(errStr);
      }
    }
  }

  /**
   * Decode Base64 URL-encoded JWT Credential Token
   * Extracts user payload safely without external dependencies
   * 
   * @param {string} token Google ID Token (JWT)
   * @returns {Object|null} Decoded user payload
   */
  parseJwt(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('[AuthManager] Failed to parse Google JWT credential:', e);
      return null;
    }
  }

  /**
   * Handle credential response from Google Identity Services
   * @param {Object} response Credential response containing ID Token
   */
  handleCredentialResponse(response) {
    try {
      console.log('[AuthManager] Received Google credential response.');
      this.clearAuthError();

      if (!response || !response.credential) {
        console.warn('[AuthManager] No credential received from Google GIS.');
        this.handleAuthError('Google Sign-In was cancelled. Enter a Callsign below or click Continue to play as Guest.');
        return;
      }

      const payload = this.parseJwt(response.credential);
      if (!payload || !payload.email) {
        console.warn('[AuthManager] Failed to decode user profile from Google token.');
        this.handleAuthError('Google profile could not be read. Enter a Callsign below or click Continue to play as Guest.');
        return;
      }

      this.applyAuthenticatedUser({
        id: payload.sub,
        email: payload.email,
        name: payload.name || payload.given_name || 'Operative',
        picture: payload.picture || null,
        emailVerified: !!payload.email_verified,
        lastSync: new Date().toLocaleTimeString(),
        token: response.credential
      });
    } catch (err) {
      console.warn('[AuthManager] Error in credential response handler:', err);
      this.handleAuthError('Google Sign-In encountered an issue. Enter a Callsign below or click Continue to play as Guest.');
    } finally {
      this.resetSignInButtonState();
      if (window.gameInstance && typeof window.gameInstance.ensureGameLoopRunning === 'function') {
        try { window.gameInstance.ensureGameLoopRunning(); } catch (e) {}
      }
    }
  }

  /**
   * Initialize Google OAuth 2.0 Token Client for explicit user-triggered popups
   */
  initTokenClient() {
    if (this.tokenClient) return;
    if (typeof window === 'undefined' || !window.google?.accounts?.oauth2 || typeof window.google.accounts.oauth2.initTokenClient !== 'function') return;

    try {
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          this.resetSignInButtonState();
          if (tokenResponse && tokenResponse.error) {
            console.warn('[AuthManager] OAuth token error:', tokenResponse.error);
            if (tokenResponse.error === 'popup_closed_by_user') {
              this.handleAuthError('Google Sign-In popup closed. Enter a Callsign below or click Continue to play as Guest.');
            } else if (/403|access_denied|unauthorized_client|forbidden/i.test(tokenResponse.error)) {
              this.handleAuth403(tokenResponse.error);
            } else if (/origin|400|not allowed/i.test(tokenResponse.error)) {
              this.handleOriginMismatch(tokenResponse.error);
            } else {
              this.handleAuthError('Google Sign-In error. Enter a Callsign below or click Continue to play as Guest.');
            }
            return;
          }
          if (tokenResponse && tokenResponse.access_token) {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              if (res.ok) {
                const profile = await res.json();
                this.applyAuthenticatedUser({
                  id: profile.sub || ('g_' + Math.random().toString(36).substring(2, 9)),
                  name: profile.name || profile.given_name || 'Operative',
                  email: profile.email || '',
                  avatar: profile.picture || '🚀',
                  isGuest: false,
                  lastSync: new Date().toLocaleTimeString()
                });
                this.closeModal();
                return;
              } else if (res.status === 403) {
                console.warn('[AuthManager] Google userinfo fetch returned HTTP 403 Forbidden');
                this.handleAuth403('HTTP 403 Forbidden on userinfo');
                return;
              }
            } catch (fetchErr) {
              console.warn('[AuthManager] Failed to fetch Google userinfo:', fetchErr);
              if (/403|access_denied|forbidden/i.test(String(fetchErr))) {
                this.handleAuth403(String(fetchErr));
                return;
              }
            }
            // Fallback if userinfo fetch fails
            this.applyAuthenticatedUser({
              id: 'g_' + Math.random().toString(36).substring(2, 9),
              name: 'Cyber Operative',
              email: '',
              isGuest: false,
              lastSync: new Date().toLocaleTimeString()
            });
            this.closeModal();
          }
        },
        error_callback: (err) => {
          this.resetSignInButtonState();
          console.warn('[AuthManager] Token client error callback:', err);
          const errStr = String(err?.message || err?.error || err || '');
          if (/403|access_denied|unauthorized_client|forbidden/i.test(errStr)) {
            this.handleAuth403(errStr);
          } else if (/origin|400|not allowed|mismatch/i.test(errStr)) {
            this.handleOriginMismatch(errStr);
          } else {
            this.handleAuthError('Google Sign-In popup closed or unavailable. Enter a Callsign below or click Continue to play as Guest.');
          }
        }
      });
    } catch (e) {
      console.warn('[AuthManager] initTokenClient failed:', e);
    }
  }

  /**
   * Trigger Google Sign-In via OAuth popup or GIS One-Tap without blocking browser
   */
  signIn() {
    if (this.isOriginMismatch) {
      this.showOriginMismatchUI();
      return;
    }
    this.clearAuthError();

    const btn = document.getElementById('googleSignInBtn');
    if (btn) {
      const span = btn.querySelector('span');
      if (span) span.textContent = 'CONNECTING TO GOOGLE...';
    }

    try {
      if (window.gameInstance && typeof window.gameInstance.ensureGameLoopRunning === 'function') {
        try { window.gameInstance.ensureGameLoopRunning(); } catch (e) {}
      }

      // Initialize OAuth 2.0 token client if available
      this.initTokenClient();

      // 1. Preferred modern path: Official OAuth 2.0 Token Client popup window
      if (this.tokenClient && typeof this.tokenClient.requestAccessToken === 'function') {
        try {
          this.tokenClient.requestAccessToken({ prompt: 'consent' });
          return;
        } catch (tcErr) {
          console.warn('[AuthManager] tokenClient.requestAccessToken error:', tcErr);
        }
      }

      // 2. If Google Identity Services SDK is not loaded
      if (!window.google?.accounts?.id) {
        console.warn('[AuthManager] Google Identity Services is not loaded or blocked by adblocker. Falling back gracefully to Callsign / Guest mode.');
        this.handleAuthError('Google Sign-In is unavailable or blocked by adblocker. Enter a Callsign below or click Continue to play as Guest.');
        return;
      }

      // 3. Fallback to GIS One-Tap prompt
      if (this.isConfigured() && window.google?.accounts?.id) {
        try {
          let promptHandled = false;
          window.google.accounts.id.prompt((notification) => {
            promptHandled = true;
            try {
              if (notification.isNotDisplayed()) {
                const reason = typeof notification.getNotDisplayedReason === 'function' ? notification.getNotDisplayedReason() : '';
                console.warn('[AuthManager] GIS prompt not displayed on this domain:', reason);
                if (/403|access_denied|forbidden/i.test(reason)) {
                  this.handleAuth403(reason);
                } else if (/origin|400|not allowed|mismatch/i.test(reason)) {
                  this.handleOriginMismatch(reason);
                } else {
                  this.handleAuthError('Google Sign-In unavailable on this domain. Enter a Callsign below or click Continue to play as Guest.');
                }
              } else if (notification.isSkippedMoment()) {
                const reason = typeof notification.getSkippedReason === 'function' ? notification.getSkippedReason() : '';
                console.warn('[AuthManager] GIS prompt skipped:', reason);
                this.handleAuthError('Google Sign-In was skipped. Enter a Callsign below or click Continue to play as Guest.');
              } else if (notification.isDismissedMoment()) {
                const reason = typeof notification.getDismissedReason === 'function' ? notification.getDismissedReason() : '';
                console.log('[AuthManager] User dismissed Google popup/prompt:', reason);
                this.handleAuthError('Google Sign-In popup closed. Enter a Callsign below or click Continue to play as Guest.');
              }
            } catch (notifErr) {
              console.warn('[AuthManager] Error in GIS notification handler:', notifErr);
              const errStr = String(notifErr?.message || notifErr || '');
              if (/403|access_denied|forbidden/i.test(errStr)) {
                this.handleAuth403(errStr);
              } else if (/origin|400|not allowed|mismatch/i.test(errStr)) {
                this.handleOriginMismatch(errStr);
              } else {
                this.handleAuthError('Google Sign-In unavailable. Enter a Callsign below or click Continue to play as Guest.');
              }
            } finally {
              this.resetSignInButtonState();
              if (window.gameInstance && typeof window.gameInstance.ensureGameLoopRunning === 'function') {
                try { window.gameInstance.ensureGameLoopRunning(); } catch (e) {}
              }
            }
          });

          setTimeout(() => {
            if (!promptHandled && !this.currentUser) {
              this.resetSignInButtonState();
            }
          }, 3000);
          return;
        } catch (err) {
          console.warn('[AuthManager] Prompt error, falling back:', err);
          const errStr = String(err?.message || err || '');
          if (/origin|400|not allowed|mismatch/i.test(errStr)) {
            this.handleOriginMismatch(errStr);
          } else {
            this.handleAuthError('Google Sign-In error. Enter a Callsign below or click Continue to play as Guest.');
          }
          return;
        }
      }

      this.handleAuthError('Google Sign-In unavailable. Enter a Callsign below or click Continue to play as Guest.');
    } catch (outerErr) {
      console.warn('[AuthManager] Safe sign-in fallback on error:', outerErr);
      const errStr = String(outerErr?.message || outerErr || '');
      if (/origin|400|not allowed|mismatch/i.test(errStr)) {
        this.handleOriginMismatch(errStr);
      } else {
        this.handleAuthError('Google Sign-In error. Enter a Callsign below or click Continue to play as Guest.');
      }
    } finally {
      this.resetSignInButtonState();
      if (window.gameInstance && typeof window.gameInstance.ensureGameLoopRunning === 'function') {
        try { window.gameInstance.ensureGameLoopRunning(); } catch (e) {}
      }
    }
  }

  /**
   * Development Test Fallback Sign-In:
   * Allows testing full UI, avatar display, and cloud sync when
   * running locally before pasting a Google Cloud Console Client ID.
   */
  simulateDevSignIn() {
    const nameInput = document.getElementById('input-operative-callsign') || document.getElementById('input-google-name');
    const customHandle = nameInput?.value?.trim() || 'Alex Vance';

    console.log('[AuthManager] Using simulated Google OAuth test profile.');
    this.applyAuthenticatedUser({
      id: 'google_test_' + Math.random().toString(36).substring(2, 9),
      email: `${customHandle.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      name: customHandle,
      picture: null,
      emailVerified: true,
      lastSync: new Date().toLocaleTimeString(),
      isDevMock: true
    });
  }

  /**
   * Register game auth hooks for state synchronization without global window leaks
   */
  setGameAuthHandler({ onUserLogin, onUserLogout, onCloudSync, getGoogleAccount }) {
    this.authHandler = { onUserLogin, onUserLogout, onCloudSync, getGoogleAccount };
  }

  /**
   * Save and bind authenticated user to game state & UI
   */
  applyAuthenticatedUser(user) {
    this.currentUser = user;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('cyber_google_user', JSON.stringify(user));
      }
    } catch (e) {}

    // Update game via registered closure handler or fallback
    if (this.authHandler && typeof this.authHandler.onUserLogin === 'function') {
      try {
        this.authHandler.onUserLogin(user);
      } catch (err) {
        console.warn('[AuthManager] Error in onUserLogin handler:', err);
      }
    } else if (window.gameInstance) {
      const g = window.gameInstance;
      if (!g.saveData) g.saveData = {};

      g.saveData.googleAccount = {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        avatar: user.picture ? null : '🎮',
        cloudSynced: true,
        lastSync: user.lastSync || new Date().toLocaleTimeString()
      };

      // Set player name to Google profile name if handle not set
      if (user.name) {
        g.saveData.playerName = user.name;
        const stageName = document.getElementById('stage-player-name');
        if (stageName) stageName.textContent = user.name;
        const inputName = document.getElementById('input-google-name');
        if (inputName) inputName.value = user.name;
      }

      if (typeof SaveManager !== 'undefined') {
        SaveManager.save(g.saveData);
      }

      if (typeof g.updateHeroPreview === 'function') g.updateHeroPreview();
      if (typeof g.showGoogleAuthModalState === 'function') g.showGoogleAuthModalState();

      if (g.audio && typeof g.audio.playLevelUp === 'function') {
        g.audio.playLevelUp();
      }

      const noteText = user.isDevMock 
        ? `Linked with Google: ${user.email} (Dev Test Mode)` 
        : `Authenticated via Google: ${user.email}`;
      g.showNotification(noteText, 'GOOGLE CLOUD CONNECTED', 'green');
    }

    this.updateModalUI();
  }

  /**
   * Load saved session from storage
   */
  loadSavedUser() {
    try {
      const saved = localStorage.getItem('cyber_google_user');
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    } catch (e) {}
  }

  /**
   * Sign Out and revoke session
   */
  signOut() {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (e) {}
    }

    this.currentUser = null;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('cyber_google_user');
      }
    } catch (e) {}

    if (this.authHandler && typeof this.authHandler.onUserLogout === 'function') {
      try { this.authHandler.onUserLogout(); } catch (err) {}
    } else if (window.gameInstance) {
      const g = window.gameInstance;
      g.saveData.googleAccount = null;
      if (typeof SaveManager !== 'undefined') {
        SaveManager.save(g.saveData);
      }
      if (typeof g.updateHeroPreview === 'function') g.updateHeroPreview();
      if (typeof g.showGoogleAuthModalState === 'function') g.showGoogleAuthModalState();
      if (g.audio && typeof g.audio.playDeflect === 'function') {
        g.audio.playDeflect();
      }
      g.showNotification('Google Account unlinked. Local save active.', 'SIGNED OUT', 'red');
    }

    this.updateModalUI();
  }

  /**
   * Sync Cloud Save state
   */
  syncCloudSave() {
    if (this.authHandler && typeof this.authHandler.onCloudSync === 'function') {
      try { this.authHandler.onCloudSync(); } catch (err) {}
    } else if (window.gameInstance) {
      const g = window.gameInstance;
      if (g.saveData?.googleAccount) {
        g.saveData.googleAccount.lastSync = new Date().toLocaleTimeString();
        if (typeof SaveManager !== 'undefined') {
          SaveManager.save(g.saveData);
        }
        const timeEl = document.getElementById('google-last-sync-time');
        if (timeEl) timeEl.textContent = `Last sync: ${g.saveData.googleAccount.lastSync}`;
        if (g.audio && typeof g.audio.playLevelUp === 'function') {
          g.audio.playLevelUp();
        }
        g.showNotification('All progress, diamonds, and loadouts synced to Google Cloud.', 'CLOUD SYNC COMPLETE', 'green');
      }
    }
  }

  /**
   * Update Modal UI based on auth state
   */
  updateModalUI() {
    const loggedInWrap = document.getElementById('google-logged-in-state');
    const loggedOutWrap = document.getElementById('google-logged-out-state');
    const nameEl = document.getElementById('google-user-display-name');
    const emailEl = document.getElementById('google-user-email');
    const avatarBadge = document.getElementById('google-user-avatar-badge');
    const avatarImg = document.getElementById('google-user-avatar-img');
    const syncTimeEl = document.getElementById('google-last-sync-time');

    const gAccount = (this.authHandler && typeof this.authHandler.getGoogleAccount === 'function')
      ? this.authHandler.getGoogleAccount()
      : (window.gameInstance?.saveData?.googleAccount);
    const gUser = this.currentUser || gAccount;

    if (gUser && gUser.email) {
      if (loggedInWrap) loggedInWrap.classList.remove('hidden');
      if (loggedOutWrap) loggedOutWrap.classList.add('hidden');
      if (nameEl) nameEl.textContent = gUser.name || 'Operative';
      if (emailEl) emailEl.textContent = gUser.email;
      if (syncTimeEl) syncTimeEl.textContent = `Last sync: ${gUser.lastSync || 'Just now'}`;

      if (gUser.picture && avatarImg) {
        avatarImg.src = gUser.picture;
        avatarImg.classList.remove('hidden');
        if (avatarBadge) avatarBadge.classList.add('hidden');
      } else {
        if (avatarImg) avatarImg.classList.add('hidden');
        if (avatarBadge) {
          avatarBadge.textContent = gUser.avatar || '🎮';
          avatarBadge.classList.remove('hidden');
        }
      }
    } else {
      if (loggedInWrap) loggedInWrap.classList.add('hidden');
      if (loggedOutWrap) loggedOutWrap.classList.remove('hidden');
    }
  }

  resetSignInButtonState() {
    try {
      const btn = document.getElementById('googleSignInBtn');
      if (btn) {
        btn.disabled = false;
        btn.style.pointerEvents = 'auto';
        btn.style.opacity = '1';
        const span = btn.querySelector('span');
        if (span) span.textContent = 'SIGN IN WITH GOOGLE';
      }
      const topSignInBtn = document.getElementById('signInBtn');
      if (topSignInBtn) {
        topSignInBtn.disabled = false;
        topSignInBtn.style.pointerEvents = 'auto';
        topSignInBtn.style.opacity = '1';
      }
      if (window.gameInstance && typeof window.gameInstance.ensureGameLoopRunning === 'function') {
        try { window.gameInstance.ensureGameLoopRunning(); } catch (e) {}
      }
    } catch (e) {}
  }

  showAuthError(message) {
    const ids = ['google-auth-error-callsign', 'google-auth-error'];
    ids.forEach((id) => {
      const errEl = document.getElementById(id);
      if (errEl) {
        errEl.textContent = message;
        errEl.classList.remove('hidden', 'modal-hidden');
        errEl.style.display = 'block';
        errEl.style.color = '#ff4d6d';
        errEl.style.background = 'rgba(255, 77, 109, 0.12)';
        errEl.style.border = '1px solid rgba(255, 77, 109, 0.4)';
        errEl.style.borderRadius = '6px';
        errEl.style.padding = '8px 12px';
        errEl.style.marginTop = '6px';
        errEl.style.textAlign = 'center';
        errEl.style.fontSize = '0.78rem';
        errEl.style.fontFamily = 'monospace';
        errEl.style.lineHeight = '1.4';
        errEl.style.wordBreak = 'break-word';
        errEl.style.boxSizing = 'border-box';
        errEl.style.position = 'relative';
        errEl.style.zIndex = '10';
        errEl.style.opacity = '1';
        errEl.style.visibility = 'visible';
      }
    });
    this.resetSignInButtonState();

    // Ensure pointer events on lobby, canvas, and modal cards are never frozen
    try {
      const canvas = document.getElementById('gameCanvas') || document.getElementById('game-canvas');
      if (canvas) canvas.style.pointerEvents = 'auto';
      const canvasContainer = document.getElementById('canvas-container');
      if (canvasContainer) canvasContainer.style.pointerEvents = 'auto';
      const uiLayer = document.querySelector('.ui-layer') || document.getElementById('ui-layer') || document.getElementById('game-container');
      if (uiLayer) uiLayer.style.pointerEvents = 'auto';
      const modalCard = document.getElementById('callsign-auth-modal');
      if (modalCard) modalCard.style.pointerEvents = 'auto';
      const authModal = document.getElementById('authModal');
      if (authModal) authModal.style.pointerEvents = 'auto';
    } catch (e) {}

    // Ensure game loop continues in the background
    if (window.gameInstance) {
      if (typeof window.gameInstance.ensureGameLoopRunning === 'function') {
        try { window.gameInstance.ensureGameLoopRunning(); } catch (e) {}
      }
      if (!window.gameInstance.gameLoopId && !window.gameInstance.isGameOver && window.gameInstance.state !== 'GAMEOVER') {
        try {
          window.gameInstance.lastTime = performance.now();
          window.gameInstance.gameLoopId = requestAnimationFrame((t) => window.gameInstance.gameLoop(t));
        } catch (e) {}
      }
    }

    // Ensure close and guest buttons remain bound and clickable
    this.bindModalControls();
  }

  clearAuthError() {
    this._originMismatchRendered = false;
    this._isHandling403 = false;
    const ids = ['google-auth-error-callsign', 'google-auth-error'];
    ids.forEach((id) => {
      const errEl = document.getElementById(id);
      if (errEl) {
        errEl.textContent = '';
        errEl.classList.add('hidden', 'modal-hidden');
        errEl.style.display = 'none';
      }
    });
    this.resetSignInButtonState();
  }

  handleAuthError(message) {
    console.warn('[AuthManager] Auth notice/error:', message);
    const msgStr = String(message || '');
    if (/403|access_denied|forbidden/i.test(msgStr)) {
      this.handleAuth403(msgStr);
      return;
    }
    if (/origin|400|not allowed|misconfigured|mismatch|gsi_logger/i.test(msgStr)) {
      this.handleOriginMismatch(msgStr);
      return;
    }
    this.showAuthError(message);
    this.resetSignInButtonState();
    if (window.gameInstance && typeof window.gameInstance.ensureGameLoopRunning === 'function') {
      try { window.gameInstance.ensureGameLoopRunning(); } catch (e) {}
    }
  }

  /**
   * Handle Google OAuth 403 Forbidden / Permission Denied gracefully.
   * Occurs when Google Cloud project OAuth consent screen is in "Testing" mode
   * and the current Google account is not added to "Test users", or when origin/CORS is forbidden.
   */
  handleAuth403(detailMsg) {
    if (this._isHandling403) return;
    this._isHandling403 = true;
    try {
      console.warn('[AuthManager] Google Auth 403 Forbidden detected:', detailMsg);
      const msg = 'Google Auth 403 (Permission Denied): If this app is in "Testing" mode, add your email under Google Cloud Console -> OAuth consent screen -> Test users, or enter a Callsign below to play as Guest.';
      this.showAuthError(msg);

      // Immediately activate manual Callsign / Guest input field and confirm button
      try {
        const section = document.querySelector('.callsign-input-section');
        if (section) {
          section.style.display = 'block';
          section.style.visibility = 'visible';
          section.style.opacity = '1';
          section.style.pointerEvents = 'auto';
        }
        const label = document.querySelector('.callsign-input-label');
        if (label) {
          label.textContent = 'ENTER CALLSIGN / GUEST SIGN-IN';
          label.style.color = '#00f0ff';
        }
        const input = document.getElementById('input-operative-callsign');
        if (input) {
          input.disabled = false;
          input.style.pointerEvents = 'auto';
          input.placeholder = 'Enter Callsign / Guest Name';
          setTimeout(() => {
            try { input.focus(); } catch (e) {}
          }, 50);
        }
        const confirmBtn = document.getElementById('btn-confirm-callsign');
        if (confirmBtn) {
          confirmBtn.disabled = false;
          confirmBtn.style.pointerEvents = 'auto';
          confirmBtn.textContent = 'CONFIRM & PLAY AS GUEST';
        }
      } catch (e) {}

      // Ensure modal close controls and backdrop remain fully functional
      this.ensureCloseControlsActive();
    } finally {
      this._isHandling403 = false;
      this.resetSignInButtonState();
      if (window.gameInstance && typeof window.gameInstance.ensureGameLoopRunning === 'function') {
        try { window.gameInstance.ensureGameLoopRunning(); } catch (e) {}
      }
    }
  }

  /**
   * Handle Google Identity Services Origin Mismatch or Status 400 errors gracefully
   */
  handleOriginMismatch(detailMsg) {
    if (this._isHandlingMismatch) return;
    const errEl = typeof document !== 'undefined' ? document.getElementById('google-auth-error-callsign') : null;
    if (this.isOriginMismatch && this._originMismatchRendered && errEl && !errEl.classList.contains('hidden') && errEl.style.display !== 'none') return;
    this._isHandlingMismatch = true;
    try {
      this.isOriginMismatch = true;
      const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
      try {
        if (typeof sessionStorage !== 'undefined' && origin) {
          sessionStorage.setItem('cyber_gis_origin_mismatch', origin);
          sessionStorage.setItem('cyber_gis_mismatch_client_id', this.clientId);
        }
      } catch (e) {}
      const cleanMsg = origin
        ? `Google auth is misconfigured for this origin (${origin}). Enter a Callsign below or click Continue to play as Guest.`
        : 'Google auth is misconfigured for this origin. Enter a Callsign below or click Continue to play as Guest.';
      this.showOriginMismatchUI(cleanMsg);
    } finally {
      this._isHandlingMismatch = false;
    }
  }

  /**
   * Render clean origin mismatch message and immediately provide manual Callsign / Guest Sign-In
   */
  showOriginMismatchUI(message) {
    const errEl = typeof document !== 'undefined' ? document.getElementById('google-auth-error-callsign') : null;
    const isAlreadyVisible = this._originMismatchRendered && errEl && !errEl.classList.contains('hidden') && errEl.style.display !== 'none';
    if (isAlreadyVisible) return;
    this._originMismatchRendered = true;

    const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
    const defaultMsg = origin
      ? `Google auth is misconfigured for this origin (${origin}). Enter a Callsign below or click Continue to play as Guest.`
      : 'Google auth is misconfigured for this origin. Enter a Callsign below or click Continue to play as Guest.';
    const cleanMsg = message || defaultMsg;
    this.showAuthError(cleanMsg);

    // Immediately provide manual Callsign / Guest input field and confirm button
    try {
      const section = document.querySelector('.callsign-input-section');
      if (section) {
        section.style.display = 'block';
        section.style.visibility = 'visible';
        section.style.opacity = '1';
        section.style.pointerEvents = 'auto';
      }
      const label = document.querySelector('.callsign-input-label');
      if (label) {
        label.textContent = 'ENTER CALLSIGN / GUEST SIGN-IN';
        label.style.color = '#00f0ff';
      }
      const input = document.getElementById('input-operative-callsign');
      if (input) {
        input.disabled = false;
        input.style.pointerEvents = 'auto';
        input.placeholder = 'Enter Callsign / Guest Name';
        setTimeout(() => {
          try { input.focus(); } catch (e) {}
        }, 50);
      }
      const confirmBtn = document.getElementById('btn-confirm-callsign');
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.style.pointerEvents = 'auto';
        confirmBtn.textContent = 'CONFIRM & PLAY AS GUEST';
      }
      const gisContainer = document.getElementById('g_id_signin_container');
      if (gisContainer) {
        gisContainer.style.pointerEvents = 'none';
        if (gisContainer.hasChildNodes()) {
          gisContainer.innerHTML = '';
        }
      }
    } catch (e) {}

    // Ensure close and cancel buttons remain 100% functional and clickable
    this.ensureCloseControlsActive();
  }

  /**
   * Ensure modal close button and cancel button are fully clickable under all error states
   */
  ensureCloseControlsActive() {
    try {
      const closeBtn = document.getElementById('btn-close-callsign-modal');
      if (closeBtn) {
        closeBtn.disabled = false;
        closeBtn.style.pointerEvents = 'auto';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.zIndex = '100002';
        closeBtn.style.position = 'relative';
      }
      const cancelBtn = document.getElementById('btn-cancel-callsign-modal');
      if (cancelBtn) {
        cancelBtn.disabled = false;
        cancelBtn.style.pointerEvents = 'auto';
        cancelBtn.style.cursor = 'pointer';
        cancelBtn.style.zIndex = '100002';
        cancelBtn.style.position = 'relative';
      }
      const backdrop = document.getElementById('authModal') || document.querySelector('.auth-modal');
      if (backdrop) {
        backdrop.style.pointerEvents = 'auto';
      }
      const card = document.getElementById('callsign-auth-modal');
      if (card) {
        card.style.pointerEvents = 'auto';
      }
    } catch (e) {}
    this.bindModalControls();
  }

  /**
   * Allow entering a custom callsign directly in the modal to sign in as guest without requiring Google OAuth completion
   */
  loginAsGuestWithCallsign(customCallsign) {
    this.clearAuthError();
    const input = document.getElementById('input-operative-callsign');
    let val = (customCallsign || input?.value || '').trim();
    if (!val) {
      val = 'Operative_' + Math.floor(1000 + Math.random() * 9000);
    }

    if (window.gameInstance && typeof window.gameInstance.loginOperativeCallsign === 'function') {
      window.gameInstance.loginOperativeCallsign(val);
    } else {
      this.applyAuthenticatedUser({
        id: 'guest_' + Math.random().toString(36).substring(2, 9),
        name: val,
        email: '',
        isGuest: true,
        lastSync: new Date().toLocaleTimeString()
      });
    }

    this.closeModal();
  }

  /**
   * Ensure modal close button and backdrop click dismiss modal cleanly under all error states
   */
  closeModal() {
    this.clearAuthError();
    this.resetSignInButtonState();

    const authModal = document.getElementById('authModal') || document.querySelector('.auth-modal');
    if (authModal) {
      authModal.classList.add('hidden', 'modal-hidden');
      authModal.style.display = 'none';
      authModal.style.pointerEvents = 'none';
      authModal.style.opacity = '0';
      authModal.style.visibility = 'hidden';
    }
    const card = document.getElementById('callsign-auth-modal');
    if (card && card !== authModal) {
      card.classList.add('hidden', 'modal-hidden');
      card.style.display = 'none';
      card.style.pointerEvents = 'none';
    }

    if (typeof window.closeAuthModal === 'function' && window.closeAuthModal !== this.closeModal) {
      try { window.closeAuthModal(); } catch (e) {}
    }
    if (typeof window.closeAllModals === 'function') {
      try { window.closeAllModals(); } catch (e) {}
    }
    if (typeof window.cleanupDarkBackdrops === 'function') {
      try { window.cleanupDarkBackdrops(true); } catch (e) {}
    }
    if (window.gameInstance && typeof window.gameInstance.closeCallsignModal === 'function') {
      try { window.gameInstance.closeCallsignModal(); } catch (e) {}
    }

    // Ensure pointer events and animation loop are fully active
    try {
      const canvas = document.getElementById('gameCanvas') || document.getElementById('game-canvas');
      if (canvas) canvas.style.pointerEvents = 'auto';
      const canvasContainer = document.getElementById('canvas-container');
      if (canvasContainer) canvasContainer.style.pointerEvents = 'auto';
      const uiLayer = document.querySelector('.ui-layer') || document.getElementById('ui-layer') || document.getElementById('game-container');
      if (uiLayer) uiLayer.style.pointerEvents = 'auto';
    } catch (e) {}

    if (window.gameInstance && typeof window.gameInstance.ensureGameLoopRunning === 'function') {
      try { window.gameInstance.ensureGameLoopRunning(); } catch (e) {}
    }
  }

  /**
   * Bind event listeners for close buttons, backdrop click, and guest callsign confirmation
   */
  bindModalControls() {
    if (typeof document === 'undefined') return;

    // Close button (X)
    const closeBtn = document.getElementById('btn-close-callsign-modal');
    if (closeBtn && typeof closeBtn.addEventListener === 'function' && !closeBtn._authBound) {
      closeBtn._authBound = true;
      closeBtn.addEventListener('click', (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        this.closeModal();
      });
    }

    // Cancel button
    const cancelBtn = document.getElementById('btn-cancel-callsign-modal');
    if (cancelBtn && typeof cancelBtn.addEventListener === 'function' && !cancelBtn._authBound) {
      cancelBtn._authBound = true;
      cancelBtn.addEventListener('click', (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        this.closeModal();
      });
    }

    // Backdrop click
    const backdrop = document.getElementById('authModal') || document.querySelector('.auth-modal');
    if (backdrop && typeof backdrop.addEventListener === 'function' && !backdrop._authBound) {
      backdrop._authBound = true;
      backdrop.addEventListener('click', (e) => {
        if (e && e.target === backdrop) {
          if (typeof e.preventDefault === 'function') e.preventDefault();
          this.closeModal();
        }
      });
    }

    // Custom Callsign / Guest Sign-In button
    const confirmBtn = document.getElementById('btn-confirm-callsign');
    if (confirmBtn && typeof confirmBtn.addEventListener === 'function' && !confirmBtn._authBound) {
      confirmBtn._authBound = true;
      confirmBtn.addEventListener('click', (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        const input = document.getElementById('input-operative-callsign');
        this.loginAsGuestWithCallsign(input?.value);
      });
    }

    // Enter key on Callsign input
    const callsignInput = document.getElementById('input-operative-callsign');
    if (callsignInput && typeof callsignInput.addEventListener === 'function' && !callsignInput._authBound) {
      callsignInput._authBound = true;
      callsignInput.addEventListener('keydown', (e) => {
        if (e && e.key === 'Enter') {
          if (typeof e.preventDefault === 'function') e.preventDefault();
          this.loginAsGuestWithCallsign(callsignInput.value);
        }
      });
    }

    // Google Sign-In button trigger
    const googleBtn = document.getElementById('googleSignInBtn');
    if (googleBtn && typeof googleBtn.addEventListener === 'function' && !googleBtn._authBound) {
      googleBtn._authBound = true;
      googleBtn.addEventListener('click', (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        this.signIn();
      });
    }
  }
}

// Global Singleton Instance
window.AuthManager = new AuthManager();

// Global Unhandled Error Guard for GIS Script / Status 400 / Status 403
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function' && !window._authGlobalErrorBound) {
  window._authGlobalErrorBound = true;
  window.addEventListener('error', function(event) {
    try {
      const errStr = (event && (event.message || event.filename || (event.error && event.error.message)))
        ? String(event.message || event.filename || event.error?.message)
        : '';
      const isGoogleErr = /google|accounts\.google|oauth|gis|gsi/i.test(errStr);
      if (/403|access_denied|forbidden/i.test(errStr) && isGoogleErr) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        try {
          if (typeof _origConsoleWarn === 'function') {
            _origConsoleWarn.call(console, '[AuthManager] Intercepted Google 403 Forbidden error event.');
          }
        } catch (e) {}
        if (window.AuthManager && typeof window.AuthManager.handleAuth403 === 'function') {
          window.AuthManager.handleAuth403(errStr);
        }
      } else if (/\[GSI_LOGGER\]|accounts\.google\.com.*origin|origin.*not allowed|status.*400|origin_mismatch/i.test(errStr)) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        try {
          if (typeof _origConsoleWarn === 'function') {
            _origConsoleWarn.call(console, '[AuthManager] Intercepted GIS origin/status 400 error event.');
          }
        } catch (e) {}
        if (window.AuthManager && !window.AuthManager.isOriginMismatch && typeof window.AuthManager.handleOriginMismatch === 'function') {
          window.AuthManager.handleOriginMismatch(errStr);
        }
      }
      if (window.gameInstance && typeof window.gameInstance.ensureGameLoopRunning === 'function') {
        try { window.gameInstance.ensureGameLoopRunning(); } catch (e) {}
      }
    } catch (e) {}
  });
}

// Global Unhandled Promise Rejection Guard for Google Auth & Async Failures
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function' && !window._authUnhandledRejectionBound) {
  window._authUnhandledRejectionBound = true;
  window.addEventListener('unhandledrejection', function(event) {
    try {
      const reasonStr = event && event.reason ? (event.reason.message || String(event.reason)) : '';
      const is403Error = (/403|forbidden|access_denied/i.test(reasonStr)) && (/google|accounts\.google|oauth|gis|userinfo/i.test(reasonStr));
      const isOriginError = /origin|400|not allowed|\[GSI_LOGGER\]|origin_mismatch/i.test(reasonStr);
      const isAuthRelated = /google|gis|idpiframe|popup|oauth|token/i.test(reasonStr);
      if (is403Error) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        try {
          if (typeof _origConsoleWarn === 'function') {
            _origConsoleWarn.call(console, '[AuthManager] Handled unhandled Google OAuth 403 rejection.');
          }
        } catch (e) {}
        if (window.AuthManager && typeof window.AuthManager.handleAuth403 === 'function') {
          window.AuthManager.handleAuth403(reasonStr);
        }
      } else if (isOriginError) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        try {
          if (typeof _origConsoleWarn === 'function') {
            _origConsoleWarn.call(console, '[AuthManager] Handled unhandled Google OAuth origin rejection.');
          }
        } catch (e) {}
        if (window.AuthManager && !window.AuthManager.isOriginMismatch && typeof window.AuthManager.handleOriginMismatch === 'function') {
          window.AuthManager.handleOriginMismatch(reasonStr);
        }
      } else if (isAuthRelated) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        try {
          if (typeof _origConsoleWarn === 'function') {
            _origConsoleWarn.call(console, '[AuthManager] Handled unhandled Google OAuth rejection.');
          }
        } catch (e) {}
        if (window.AuthManager && typeof window.AuthManager.handleAuthError === 'function') {
          window.AuthManager.handleAuthError('Google Sign-In was interrupted or unavailable. Enter a Callsign below or click Continue to play as Guest.');
        }
      }
      if (window.gameInstance && typeof window.gameInstance.ensureGameLoopRunning === 'function') {
        try { window.gameInstance.ensureGameLoopRunning(); } catch (e) {}
      }
    } catch (e) {}
  });
}
