// Detect native platform via the global Capacitor bridge (no static import needed).
// This avoids any module-level side effects that could crash the web build.
const isNative = () => {
  try {
    return (
      typeof window !== "undefined" &&
      window.Capacitor &&
      typeof window.Capacitor.isNativePlatform === "function" &&
      window.Capacitor.isNativePlatform()
    );
  } catch {
    return false;
  }
};

// Lazy-loaded plugin references — populated only on first native use.
let Geolocation = null;
let CapApp = null;
let StatusBar = null;
let Style = null;
let SplashScreen = null;
let _pluginsLoaded = false;

const loadPlugins = async () => {
  if (_pluginsLoaded) return;
  _pluginsLoaded = true;
  try {
    Geolocation = (await import("@capacitor/geolocation")).Geolocation;
    CapApp = (await import("@capacitor/app")).App;
    const sb = await import("@capacitor/status-bar");
    StatusBar = sb.StatusBar;
    Style = sb.Style;
    SplashScreen = (await import("@capacitor/splash-screen")).SplashScreen;
  } catch (e) {
    console.warn("Failed to load Capacitor plugins:", e);
  }
};

/**
 * Get current GPS coordinates using Capacitor Geolocation on native Android,
 * falling back to browser navigator.geolocation on web.
 */
export const getCurrentCoordinates = async (options = {}) => {
  const geoOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000,
    ...options,
  };

  if (isNative()) {
    await loadPlugins();
    if (!Geolocation) throw new Error("Geolocation plugin not available");

    const perms = await Geolocation.checkPermissions();
    if (
      perms.location !== "granted" &&
      perms.coarseLocation !== "granted"
    ) {
      const requested = await Geolocation.requestPermissions();
      if (
        requested.location !== "granted" &&
        requested.coarseLocation !== "granted"
      ) {
        const err = new Error(
          "Location access denied. Please enable location permissions in Android settings."
        );
        err.code = 1;
        err.PERMISSION_DENIED = 1;
        throw err;
      }
    }

    const pos = await Geolocation.getCurrentPosition(geoOptions);
    return {
      coords: {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      },
    };
  }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, geoOptions);
  });
};

/**
 * Native Android TTS bridge exposed on window.AndroidNative from MainActivity.
 */
export const hasNativeTTS = () =>
  typeof window !== "undefined" &&
  typeof window.AndroidNative?.speak === "function";

export const nativeSpeak = (text, language = "en-US") =>
  new Promise((resolve, reject) => {
    if (!hasNativeTTS()) {
      reject(new Error("Native TTS unavailable"));
      return;
    }
    try {
      window._sevaTTSResolve = resolve;
      window.AndroidNative.speak(text, language);
      // Fallback resolve in case TTS callback doesn't fire on some engines
      setTimeout(() => {
        if (window._sevaTTSResolve === resolve) {
          window._sevaTTSResolve = null;
          resolve();
        }
      }, Math.min(Math.max(text.length * 90, 2500), 25000));
    } catch (e) {
      reject(e);
    }
  });

export const nativeStopSpeak = () => {
  if (typeof window !== "undefined" && window.AndroidNative?.stopSpeaking) {
    try {
      window.AndroidNative.stopSpeaking();
    } catch {
      // Ignore
    }
  }
  if (typeof window !== "undefined" && window._sevaTTSResolve) {
    window._sevaTTSResolve();
    window._sevaTTSResolve = null;
  }
};

/**
 * Ask Android native activity to ensure RECORD_AUDIO permission before getUserMedia.
 */
export const ensureNativeAudioPermission = async () => {
  if (!isNative()) return true;
  if (typeof window.AndroidNative?.requestAudioPermission !== "function") {
    return true;
  }
  return new Promise((resolve) => {
    window._sevaAudioPermResolve = resolve;
    try {
      window.AndroidNative.requestAudioPermission();
      setTimeout(() => {
        if (window._sevaAudioPermResolve === resolve) {
          window._sevaAudioPermResolve = null;
          resolve(true);
        }
      }, 15000);
    } catch {
      resolve(true);
    }
  });
};

/**
 * Initialize Android status bar, splash screen, and hardware back button.
 */
export const initNativeShell = (onBack) => {
  if (!isNative()) {
    return () => {};
  }

  // Load plugins async, then configure native shell
  loadPlugins().then(() => {
    if (StatusBar) {
      StatusBar.setBackgroundColor({ color: "#1e40af" }).catch(() => {});
      StatusBar.setStyle({ style: Style?.Dark }).catch(() => {});
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
    }
    if (SplashScreen) {
      SplashScreen.hide().catch(() => {});
    }
  });

  // Back button via dynamic import
  let backCleanup = () => {};
  loadPlugins().then(() => {
    if (CapApp) {
      const backHandlePromise = CapApp.addListener("backButton", ({ canGoBack }) => {
        if (onBack) {
          onBack(canGoBack, () => CapApp.exitApp());
        } else if (canGoBack) {
          window.history.back();
        } else {
          CapApp.exitApp();
        }
      });
      backCleanup = () => {
        backHandlePromise.then((h) => h.remove()).catch(() => {});
      };
    }
  });

  return () => backCleanup();
};
