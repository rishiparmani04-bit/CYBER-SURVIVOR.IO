/**
 * ============================================================================
 * GOOGLE IDENTITY SERVICES (GIS) / OAUTH 2.0 AUTHENTICATION MANAGER
 * ============================================================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Visit Google Cloud Console: https://console.cloud.google.com/apis/credentials
 * 2. Create a project (or select an existing one) and configure the "OAuth Consent Screen".
 * 3. Go to "Credentials" -> "Create Credentials" -> "OAuth client ID".
 * 4. Application type: "Web application".
 * 5. Under "Authorized JavaScript origins", add your origins:
 *    - http://localhost
 *    - http://localhost:8080
 *    - http://127.0.0.1:5500
 *    - (and your production domain once deployed)
 * 6. Copy your Client ID and replace GOOGLE_CLIENT_ID below:
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
   * Check whether a real Client ID has been configured
   */
  isConfigured() {
    return this.clientId && !this.clientId.includes('YOUR_GOOGLE_CLIENT_ID');
  }

  /**
   * Initialize Google Identity Services SDK
   */
  init() {
    // Check if GIS script has loaded
    if (typeof window.google !== 'undefined' && window.google.accounts && window.google.accounts.id) {
      this.setupGis();
    } else {
      // Poll briefly for script load
      let attempts = 0;
      const pollInterval = setInterval(() => {
        attempts++;
        if (typeof window.google !== 'undefined' && window.google.accounts && window.google.accounts.id) {
          clearInterval(pollInterval);
          this.setupGis();
        } else if (attempts > 30) {
          clearInterval(pollInterval);
          console.warn('[AuthManager] Google Identity Services script load timed out or is blocked.');
        }
      }, 200);
    }

    // Load any existing cached session
    this.loadSavedUser();
  }

  /**
   * Configure Google Identity Services client & render button
   */
  setupGis() {
    if (this.isGisLoaded) return;
    this.isGisLoaded = true;
    console.log('[AuthManager] Initializing Google Identity Services...');

    try {
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response) => this.handleCredentialResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin'
      });

      // Render official Google button if container exists
      this.renderGisButton();
    } catch (err) {
      console.warn('[AuthManager] GIS initialization notice:', err);
    }
  }

  /**
   * Render the official Google Sign-In Button into #g_id_signin_container
   */
  renderGisButton() {
    const container = document.getElementById('g_id_signin_container');
    if (!container || !window.google?.accounts?.id) return;

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
    console.log('[AuthManager] Received Google credential response.');
    this.clearAuthError();

    if (!response || !response.credential) {
      this.showAuthError('No credential received from Google.');
      return;
    }

    const payload = this.parseJwt(response.credential);
    if (!payload || !payload.email) {
      this.showAuthError('Failed to decode user profile from Google token.');
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
  }

  /**
   * Trigger Google Sign-In prompt or OAuth pop-up
   */
  signIn() {
    this.clearAuthError();

    // If real client ID is configured and GIS is available
    if (this.isConfigured() && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.warn('[AuthManager] One-Tap prompt not displayed:', notification.getNotDisplayedReason());
            // Fallback: If One-Tap suppressed, direct user to click official button
            this.showAuthError('Please click the Google button directly to authenticate.');
          } else if (notification.isSkippedMoment()) {
            console.log('[AuthManager] Prompt skipped:', notification.getSkippedReason());
          } else if (notification.isDismissedMoment()) {
            console.log('[AuthManager] User dismissed prompt.');
          }
        });
        return;
      } catch (err) {
        console.warn('[AuthManager] Prompt error:', err);
      }
    }

    // Interactive Local Fallback (for testing prior to pasting Client ID)
    this.simulateDevSignIn();
  }

  /**
   * Development Test Fallback Sign-In:
   * Allows testing full UI, avatar display, and cloud sync when
   * running locally before pasting a Google Cloud Console Client ID.
   */
  simulateDevSignIn() {
    const nameInput = document.getElementById('input-google-name');
    const customHandle = nameInput?.value.trim() || 'Alex Vance';

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
    localStorage.setItem('cyber_google_user', JSON.stringify(user));

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
    localStorage.removeItem('cyber_google_user');

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

  showAuthError(message) {
    const errEl = document.getElementById('google-auth-error');
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.remove('hidden');
    }
  }

  clearAuthError() {
    const errEl = document.getElementById('google-auth-error');
    if (errEl) {
      errEl.textContent = '';
      errEl.classList.add('hidden');
    }
  }
}

// Global Singleton Instance
window.AuthManager = new AuthManager();
