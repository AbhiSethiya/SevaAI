import { Capacitor } from "@capacitor/core";

const STORAGE_KEYS = {
  API_BASE_URL: "sevaai_api_base_url",
  AUTH_TOKEN: "sevaai_auth_token",
};

export const SERVER_PRESETS = {
  CLOUD_RENDER: "https://seva-ai-98f1.onrender.com",
  LOCAL_WIFI: "http://192.168.1.101:3000",
  USB_ADB: "http://localhost:3000",
  ANDROID_EMULATOR: "http://10.0.2.2:3000",
};

export const normalizeBaseUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  return url.trim().replace(/\/+$/, "");
};

export const isNativeApp = () => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

export const getDefaultNativeUrl = () => {
  const envUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
  return envUrl || SERVER_PRESETS.CLOUD_RENDER;
};

export const getApiBaseUrl = () => {
  try {
    const saved = normalizeBaseUrl(
      localStorage.getItem(STORAGE_KEYS.API_BASE_URL)
    );
    if (saved) return saved;
  } catch {
    // Ignore storage access errors
  }

  const envUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
  if (envUrl) return envUrl;

  if (isNativeApp()) {
    return SERVER_PRESETS.CLOUD_RENDER;
  }

  return "";
};

export const setApiBaseUrl = (url) => {
  const normalized = normalizeBaseUrl(url);
  if (!normalized) {
    localStorage.removeItem(STORAGE_KEYS.API_BASE_URL);
  } else {
    localStorage.setItem(STORAGE_KEYS.API_BASE_URL, normalized);
  }
  window.dispatchEvent(
    new CustomEvent("sevaai:server-url-changed", { detail: normalized })
  );
  return getApiBaseUrl();
};

export const resetApiBaseUrl = () => {
  localStorage.removeItem(STORAGE_KEYS.API_BASE_URL);
  window.dispatchEvent(
    new CustomEvent("sevaai:server-url-changed", {
      detail: getApiBaseUrl(),
    })
  );
  return getApiBaseUrl();
};

export const apiUrl = (path) => {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const fullPath = normalizedPath.startsWith("/api")
    ? normalizedPath
    : `/api${normalizedPath}`;
  return `${base}${fullPath}`;
};

export const getAuthToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || "";
  } catch {
    return "";
  }
};

export const setAuthToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  } catch {
    // Ignore storage errors
  }
};

export const clearAuthToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch {
    // Ignore storage errors
  }
};

export const checkServerHealth = async (candidateUrl) => {
  const base = normalizeBaseUrl(candidateUrl ?? getApiBaseUrl());

  // Render free-tier cold starts can take up to 60s, so use a generous timeout
  const TIMEOUT_MS = 65000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Try /api/health first; if it 404s fall back to root /
  const endpoints = [`${base}/api/health`, base || "/"];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "GET",
        mode: "cors",
        signal: controller.signal,
      });
      // Any response (even 404 HTML) proves the server is reachable
      if (res.status < 500) {
        let data = {};
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          data = await res.json().catch(() => ({}));
        }
        clearTimeout(timeout);
        return { ok: true, data, url: base };
      }
    } catch (innerErr) {
      // If the first endpoint fails with a CORS/network error, try the next
      if (innerErr.name === "AbortError") break; // timeout — stop trying
      continue;
    }
  }

  clearTimeout(timeout);
  return {
    ok: false,
    error:
      "Could not reach server. If using Render free tier, the first request may take ~60s — please tap Test again.",
    url: base,
  };
};
