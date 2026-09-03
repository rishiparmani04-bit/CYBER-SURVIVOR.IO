/**
 * ============================================================================
 * GOOGLE H5 GAMES ADS SDK - AD MANAGER
 * ============================================================================
 * Official integration for Google AdSense / AdMob for HTML5 Games (H5 Games Ads).
 * Handles interstitial ('next') and rewarded ('reward') ad breaks with:
 * - Strict accessibility compliance (no aria-hidden on document.body or containers)
 * - Safe game loop unpausing and Web Audio restoration
 * - UI overlay cleanup and resets
 * - Guaranteed reward crediting even if the ad is dismissed early or blocked
 */

class AdManager {
  constructor() {
    this.isAdShowing = false;
    this.isSdkReady = false;
    this.lastAdTime = 0;
    this.minIntervalBetweenInterstitials = 45000; // 45 seconds between interstitials

    // Callbacks registered by the game
    this.onAdStartCallback = null;
    this.onAdEndCallback = null;

    this.init();
    this.setupAccessibilityWatchdog();
  }

  /**
   * Initialize Google H5 Games Ads configuration
   */
  init() {
    // Ensure clean accessibility state immediately
    this.cleanupAccessibilityBlocks();

    // Configure H5 Games Ads SDK
    if (typeof window.adConfig === 'function') {
      try {
        window.adConfig({
          preloadAdBreaks: 'on',
          sound: 'on',
          onReady: () => {
            this.isSdkReady = true;
            console.log('[AdManager] Google H5 Games Ads SDK is ready.');
          }
        });
      } catch (e) {
        console.warn('[AdManager] adConfig initialization notice:', e);
      }
    }

    // Fallback: If SDK loaded before adConfig or adConfig ready event fired
    if (window.adsbygoogle && window.adsbygoogle.loaded) {
      this.isSdkReady = true;
    }
  }

  /**
   * Ensure NO aria-hidden='true' is applied to document.body or parent containers.
   * Applying aria-hidden to document.body triggers browser accessibility blocks
   * and causes Google H5 Ads to immediately dismiss or freeze.
   */
  cleanupAccessibilityBlocks() {
    try {
      if (document.body) {
        if (document.body.hasAttribute('aria-hidden')) {
          document.body.removeAttribute('aria-hidden');
        }
      }
      if (document.documentElement) {
        if (document.documentElement.hasAttribute('aria-hidden')) {
          document.documentElement.removeAttribute('aria-hidden');
        }
      }
      const containers = document.querySelectorAll(
        '#canvas-container, #game-hud, #menu-screen, .ui-layer, .modal-backdrop, main, #app, #canvas'
      );
      containers.forEach((el) => {
        if (el && el.getAttribute('aria-hidden') === 'true') {
          el.removeAttribute('aria-hidden');
        }
      });
    } catch (e) {
      console.warn('[AdManager] Accessibility cleanup error:', e);
    }
  }

  /**
   * Watchdog to actively intercept and strip any aria-hidden='true' added to document.body
   */
  setupAccessibilityWatchdog() {
    if (typeof MutationObserver !== 'undefined' && document.body) {
      try {
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
              if (document.body.getAttribute('aria-hidden') === 'true') {
                console.log('[AdManager] Stripping invalid aria-hidden from document.body to prevent ad freeze.');
                document.body.removeAttribute('aria-hidden');
              }
            }
          }
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['aria-hidden'] });
      } catch (e) {}
    }
  }

  /**
   * Register global hooks for game pause / audio mute
   * @param {Object} hooks { onAdStart: Function, onAdEnd: Function }
   */
  setGameHooks({ onAdStart, onAdEnd }) {
    this.onAdStartCallback = onAdStart;
    this.onAdEndCallback = onAdEnd;
  }

  /**
   * Properly unpauses the game loop, restores audio, and resets all ad UI overlays
   */
  unpauseAndResetOverlays() {
    this.isAdShowing = false;
    this.lastAdTime = Date.now();

    // 1. Unpause game & audio via registered callback
    try {
      if (typeof this.onAdEndCallback === 'function') {
        this.onAdEndCallback();
      }
    } catch (err) {
      console.warn('[AdManager] Error in onAdEndCallback:', err);
    }

    // 2. Ensure gameInstance unpauses if available
    if (window.gameInstance) {
      window.gameInstance.isAdShowing = false;
      if (typeof window.gameInstance.onAdEnd === 'function') {
        try { window.gameInstance.onAdEnd(); } catch (e) {}
      }
      if (typeof window.gameInstance.resetAdUIOverlays === 'function') {
        try { window.gameInstance.resetAdUIOverlays(); } catch (e) {}
      }
    }

    // 3. Reset and hide any in-game ad modal overlays
    try {
      const rewardedModal = document.getElementById('rewarded-ad-modal');
      if (rewardedModal) rewardedModal.classList.add('hidden');

      const hubModal = document.getElementById('earn-diamonds-modal');
      if (hubModal) hubModal.classList.add('hidden');

      const claimBtn = document.getElementById('btn-claim-ad-reward');
      if (claimBtn) {
        claimBtn.disabled = false;
        claimBtn.classList.remove('disabled');
        claimBtn.innerHTML = '<span>💎 CLAIM +25 DIAMONDS NOW!</span>';
      }

      const progressBar = document.getElementById('ad-progress-bar');
      if (progressBar) progressBar.style.width = '100%';
    } catch (e) {}

    // 4. Remove any aria-hidden locks
    this.cleanupAccessibilityBlocks();
  }

  /**
   * Show an Interstitial Ad Break (adBreak type: 'next')
   * 
   * @param {Object} options
   * @param {string} options.name Placement name
   * @param {Function} [options.beforeAd]
   * @param {Function} [options.afterAd]
   * @param {Function} [options.onDone]
   * @param {boolean} [options.force]
   */
  showInterstitial({ name = 'game_over_screen', beforeAd, afterAd, onDone, force = false } = {}) {
    const now = Date.now();
    if (!force && (now - this.lastAdTime < this.minIntervalBetweenInterstitials)) {
      console.log('[AdManager] Interstitial skipped due to frequency cap cooldown.');
      if (typeof onDone === 'function') onDone({ breakStatus: 'cooldown_skipped' });
      return;
    }

    this.cleanupAccessibilityBlocks();
    console.log(`[AdManager] Requesting Interstitial adBreak: ${name}`);

    let completed = false;

    const handleBeforeAd = () => {
      this.isAdShowing = true;
      this.cleanupAccessibilityBlocks();
      if (this.onAdStartCallback) this.onAdStartCallback();
      if (typeof beforeAd === 'function') beforeAd();
    };

    const handleAfterAd = () => {
      this.unpauseAndResetOverlays();
      if (typeof afterAd === 'function') afterAd();
    };

    const handleAdDone = (placementInfo = {}) => {
      if (completed) return;
      completed = true;
      this.unpauseAndResetOverlays();
      if (typeof onDone === 'function') onDone(placementInfo);
    };

    const safetyTimeout = setTimeout(() => {
      if (!completed) {
        console.log('[AdManager] Interstitial safety timeout elapsed. Unpausing game.');
        handleAdDone({ breakStatus: 'timeout_or_blocked' });
      }
    }, 4000);

    if (typeof window.adBreak === 'function') {
      try {
        window.adBreak({
          type: 'next',
          name: name,
          beforeAd: () => {
            clearTimeout(safetyTimeout);
            handleBeforeAd();
          },
          afterAd: () => {
            handleAfterAd();
          },
          adBreakDone: (placementInfo) => {
            clearTimeout(safetyTimeout);
            handleAdDone(placementInfo);
          }
        });
      } catch (err) {
        console.warn('[AdManager] Error calling window.adBreak for interstitial:', err);
        clearTimeout(safetyTimeout);
        handleAdDone({ breakStatus: 'error', error: err });
      }
    } else {
      clearTimeout(safetyTimeout);
      handleAdDone({ breakStatus: 'no_sdk' });
    }
  }

  /**
   * Show a Rewarded Ad Break (adBreak type: 'reward')
   * Safely unpauses the game, resets UI overlays, and guarantees reward crediting
   * even if dismissed early, blocked, or finished.
   * 
   * @param {Object} options
   * @param {string} options.name
   * @param {Function} [options.beforeAd]
   * @param {Function} [options.afterAd]
   * @param {Function} [options.onReward]
   * @param {Function} [options.onDismiss]
   * @param {Function} [options.onDone]
   * @param {Function} [options.fallbackCustomAd]
   */
  showRewarded({
    name = 'rewarded_diamonds',
    beforeAd,
    afterAd,
    onReward,
    onDismiss,
    onDone,
    fallbackCustomAd
  } = {}) {
    this.cleanupAccessibilityBlocks();
    console.log(`[AdManager] Requesting Rewarded adBreak: ${name}`);

    let rewardCredited = false;
    let completed = false;

    // Helper: Safely credits the reward once
    const grantRewardOnce = (reason = 'ad_completed') => {
      if (rewardCredited) return;
      rewardCredited = true;
      console.log(`[AdManager] Crediting reward (${reason}).`);
      try {
        if (typeof onReward === 'function') {
          onReward();
        }
      } catch (err) {
        console.warn('[AdManager] Error executing onReward callback:', err);
      }
    };

    const handleBeforeAd = () => {
      this.isAdShowing = true;
      this.cleanupAccessibilityBlocks();
      if (this.onAdStartCallback) this.onAdStartCallback();
      if (typeof beforeAd === 'function') beforeAd();
    };

    const handleAfterAd = () => {
      this.unpauseAndResetOverlays();
      if (typeof afterAd === 'function') afterAd();
    };

    const handleAdDone = (placementInfo = {}) => {
      if (completed) return;
      completed = true;

      // Ensure game is completely unpaused & overlays reset
      this.unpauseAndResetOverlays();

      // Safely credit reward even if dismissed early or errored
      grantRewardOnce(placementInfo.breakStatus || 'adBreakDone');

      const status = placementInfo.breakStatus || 'unknown';
      if (status === 'error' || status === 'notReady' || status === 'no_sdk') {
        console.log(`[AdManager] H5 Ad not available (${status}). Launching interactive custom ad fallback.`);
        if (typeof fallbackCustomAd === 'function') {
          fallbackCustomAd();
          return;
        }
      }

      if (typeof onDone === 'function') onDone(placementInfo);
    };

    // Safety timeout: In case Google Ad script hangs or ad blocker silences callbacks
    const safetyTimeout = setTimeout(() => {
      if (!completed) {
        console.log('[AdManager] Rewarded ad safety timeout elapsed. Unpausing game and crediting reward.');
        grantRewardOnce('safety_timeout_fallback');
        handleAdDone({ breakStatus: 'timeout_or_blocked' });
      }
    }, 4500);

    if (typeof window.adBreak === 'function') {
      try {
        window.adBreak({
          type: 'reward',
          name: name,
          beforeAd: () => {
            clearTimeout(safetyTimeout);
            handleBeforeAd();
          },
          afterAd: () => {
            handleAfterAd();
          },
          beforeReward: (showAdFn) => {
            clearTimeout(safetyTimeout);
            // Crucial: Clean accessibility blocks right before ad displays to avoid immediate dismissal
            this.cleanupAccessibilityBlocks();

            if (typeof showAdFn === 'function') {
              try {
                showAdFn();
              } catch (err) {
                console.warn('[AdManager] Error invoking showAdFn:', err);
                grantRewardOnce('showAdFn_error_fallback');
                this.unpauseAndResetOverlays();
              }
            } else {
              // If no showAdFn, safely credit reward and unpause
              grantRewardOnce('no_showAdFn_fallback');
              this.unpauseAndResetOverlays();
            }
          },
          adViewed: () => {
            console.log('[AdManager] Google H5 adViewed event received.');
            grantRewardOnce('adViewed');
            this.unpauseAndResetOverlays();
            handleAfterAd();
          },
          adDismissed: () => {
            console.log('[AdManager] Google H5 adDismissed event received. Crediting reward and unpausing.');
            // Crucial per requirement: Safely credit reward even if dismissed early!
            grantRewardOnce('adDismissed_early_credit');
            this.unpauseAndResetOverlays();
            handleAfterAd();
            if (typeof onDismiss === 'function') {
              try { onDismiss(); } catch (e) {}
            }
          },
          adBreakDone: (placementInfo) => {
            clearTimeout(safetyTimeout);
            this.unpauseAndResetOverlays();
            handleAdDone(placementInfo);
          }
        });
      } catch (err) {
        console.warn('[AdManager] Error calling window.adBreak for reward:', err);
        clearTimeout(safetyTimeout);
        grantRewardOnce('exception_fallback');
        handleAdDone({ breakStatus: 'error', error: err });
      }
    } else {
      clearTimeout(safetyTimeout);
      grantRewardOnce('no_sdk_fallback');
      handleAdDone({ breakStatus: 'no_sdk' });
    }
  }
}

// Global Singleton Instance
window.AdManager = new AdManager();
