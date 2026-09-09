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

const GOOGLE_CLIENT_ID = '1021532607267-2b815nvlp44h57bn092tbue56edok0on.apps.googleusercontent.com'; // <-- REPLACE WITH YOUR CLIENT ID

class AuthManager {
  constructor() {
    this.clientId = GOOGLE_CLIENT_ID;
    this.isGisLoaded = false;
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
          const errType = (err && (err.type || err.message)) ? String(err.type || err.message) : '';
          let msg = 'Google Sign-In unavailable on this domain. Enter a Callsign below or click Continue to play as Guest.';
          if (errType.includes('popup_closed') || errType.includes('user_cancel')) {
            msg = 'Google Sign-In popup closed. Enter a Callsign below or click Continue to play as Guest.';
          } else if (errType.includes('origin')) {
            msg = 'Google OAuth domain mismatch. Enter a Callsign below or click Continue to play as Guest.';
          }
          this.handleAuthError(msg);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin'
      });

      // Render official Google button if container exists
      this.renderGisButton();
    } catch (err) {
      console.warn('[AuthManager] Google Identity Services initialization failed or was blocked by browser security. Continuing execution immediately in guest mode:', err);
      this.continueInGuestMode();
      this.handleAuthError('Google Sign-In unavailable on this domain or blocked by adblocker. Enter a Callsign below or click Continue to play as Guest.');
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
   * Trigger Google Sign-In via explicitly rendered button without blocking browser
   */
  signIn() {
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

      // Explicitly render GIS button in container
      this.renderGisButton();

      const container = document.getElementById('g_id_signin_container');
      const renderedBtn = (container && typeof container.querySelector === 'function') 
        ? container.querySelector('div[role="button"], button, iframe') 
        : null;
      if (renderedBtn) {
        try {
          renderedBtn.click();
          setTimeout(() => this.resetSignInButtonState(), 1000);
          return;
        } catch (e) {}
      }

      // If Google Identity Services is not available or blocked by adblocker
      if (!window.google?.accounts?.id) {
        console.warn('[AuthManager] Google Identity Services is not loaded or blocked by adblocker. Falling back gracefully to Callsign / Guest mode.');
        this.handleAuthError('Google Sign-In is unavailable or blocked by adblocker. Enter a Callsign below or click Continue to play as Guest.');
        return;
      }

      // If real client ID is configured and GIS is available, use non-blocking prompt with watchdog
      if (this.isConfigured() && window.google?.accounts?.id) {
        try {
          let promptHandled = false;
          window.google.accounts.id.prompt((notification) => {
            promptHandled = true;
            try {
              if (notification.isNotDisplayed()) {
                const reason = typeof notification.getNotDisplayedReason === 'function' ? notification.getNotDisplayedReason() : '';
                console.warn('[AuthManager] GIS prompt not displayed on this domain:', reason);
                this.handleAuthError('Google Sign-In unavailable on this domain. Enter a Callsign below or click Continue to play as Guest.');
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
              this.handleAuthError('Google Sign-In unavailable. Enter a Callsign below or click Continue to play as Guest.');
            } finally {
              this.resetSignInButtonState();
              if (window.gameInstance && typeof window.gameInstance.ensureGameLoopRunning === 'function') {
                try { window.gameInstance.ensureGameLoopRunning(); } catch (e) {}
              }
            }
          });

          // Fast Watchdog: prevent browser hang if One-Tap is suppressed or blocked
          setTimeout(() => {
            if (!promptHandled && !this.currentUser) {
              console.warn('[AuthManager] GIS prompt watchdog timeout.');
              this.handleAuthError('Google Sign-In timed out or unavailable on this domain. Enter a Callsign below or click Continue to play as Guest.');
            }
            this.resetSignInButtonState();
          }, 800);
          return;
        } catch (err) {
          console.warn('[AuthManager] Prompt error, falling back:', err);
          this.handleAuthError('Google Sign-In error. Enter a Callsign below or click Continue to play as Guest.');
          return;
        }
      }

      // Interactive Local Fallback if unconfigured
      this.handleAuthError('Google Sign-In unavailable. Enter a Callsign below or click Continue to play as Guest.');
    } catch (outerErr) {
      console.warn('[AuthManager] Safe sign-in fallback on error:', outerErr);
      this.handleAuthError('Google Sign-In error. Enter a Callsign below or click Continue to play as Guest.');
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
    if (window.gameInstance && typeof window.gameInstance.ensureGameLoopRunning === 'function') {
      try { window.gameInstance.ensureGameLoopRunning(); } catch (e) {}
    }
  }

  clearAuthError() {
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
    this.showAuthError(message);
    this.resetSignInButtonState();
    if (window.gameInstance && typeof window.gameInstance.ensureGameLoopRunning === 'function') {
      try { window.gameInstance.ensureGameLoopRunning(); } catch (e) {}
    }
  }
}

// Global Singleton Instance
window.AuthManager = new AuthManager();

// Global Unhandled Promise Rejection Guard for Google Auth & Async Failures
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function' && !window._authUnhandledRejectionBound) {
  window._authUnhandledRejectionBound = true;
  window.addEventListener('unhandledrejection', function(event) {
    try {
      const reasonStr = event && event.reason ? (event.reason.message || String(event.reason)) : '';
      const isAuthRelated = /google|gis|idpiframe|popup|oauth|origin_mismatch|token/i.test(reasonStr);
      if (isAuthRelated) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        console.warn('[AuthManager] Handled unhandled Google OAuth rejection:', reasonStr);
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
