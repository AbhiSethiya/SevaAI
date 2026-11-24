import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { App as CapApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";

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

  if (Capacitor.isNativePlatform()) {
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
  if (!Capacitor.isNativePlatform()) return true;
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
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  StatusBar.setBackgroundColor({ color: "#1e40af" }).catch(() => {});
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
  SplashScreen.hide().catch(() => {});

  const backHandlePromise = CapApp.addListener("backButton", ({ canGoBack }) => {
    if (onBack) {
      onBack(canGoBack, () => CapApp.exitApp());
    } else if (canGoBack) {
      window.history.back();
    } else {
      CapApp.exitApp();
    }
  });

  return () => {
    backHandlePromise.then((h) => h.remove()).catch(() => {});
  };
};
