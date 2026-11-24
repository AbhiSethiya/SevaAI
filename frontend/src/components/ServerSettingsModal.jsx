import { useState, useEffect } from "react";
import { Server, CheckCircle, AlertCircle, RefreshCw, X } from "lucide-react";
import {
  getApiBaseUrl,
  setApiBaseUrl,
  resetApiBaseUrl,
  checkServerHealth,
  SERVER_PRESETS,
  isNativeApp,
} from "../lib/config";

const ServerSettingsModal = ({ isOpen, onClose, onSaved }) => {
  const [urlInput, setUrlInput] = useState("");
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setUrlInput(getApiBaseUrl());
      setStatus(null);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async (candidate = urlInput) => {
    setTesting(true);
    setStatus(null);
    const result = await checkServerHealth(candidate);
    setTesting(false);
    if (result.ok) {
      setStatus({
        type: "success",
        message: `Connected to SevaAI backend (${result.url || "same origin"})`,
      });
    } else {
      setStatus({
        type: "error",
        message: `Could not reach ${result.url || "backend"}: ${result.error}`,
      });
    }
    return result.ok;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setApiBaseUrl(urlInput);
    const ok = await handleTest(urlInput);
    if (onSaved) onSaved(ok);
    if (ok) {
      setTimeout(() => onClose(), 500);
    }
  };

  const applyPreset = (presetUrl) => {
    setUrlInput(presetUrl);
    setStatus(null);
  };

  const handleReset = () => {
    const nextUrl = resetApiBaseUrl();
    setUrlInput(nextUrl);
    setStatus(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 z-10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close server settings"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Backend Server Settings
            </h2>
            <p className="text-xs text-gray-500">
              {isNativeApp()
                ? "Configure where this Android app connects for AI & database APIs"
                : "Optional API server URL override (leave blank for default proxy)"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label
              htmlFor="sevaai-server-url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Server URL
            </label>
            <input
              id="sevaai-server-url"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="http://192.168.1.101:3000 or https://your-app.onrender.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">
              Quick Presets:
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => applyPreset(SERVER_PRESETS.CLOUD_RENDER)}
                className="text-left px-3 py-2 text-xs bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              >
                <span className="font-semibold text-emerald-800">
                  Render Cloud (Live Anywhere):
                </span>{" "}
                <span className="text-emerald-700 block truncate">
                  {SERVER_PRESETS.CLOUD_RENDER}
                </span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset(SERVER_PRESETS.LOCAL_WIFI)}
                className="text-left px-3 py-2 text-xs bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
              >
                <span className="font-semibold text-gray-800">
                  Local PC Wi-Fi:
                </span>{" "}
                <span className="text-blue-700">{SERVER_PRESETS.LOCAL_WIFI}</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset(SERVER_PRESETS.USB_ADB)}
                className="text-left px-3 py-2 text-xs bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
              >
                <span className="font-semibold text-gray-800">
                  USB Cable (adb reverse tcp:3000):
                </span>{" "}
                <span className="text-blue-700">{SERVER_PRESETS.USB_ADB}</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset(SERVER_PRESETS.ANDROID_EMULATOR)}
                className="text-left px-3 py-2 text-xs bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
              >
                <span className="font-semibold text-gray-800">
                  Android Studio Emulator:
                </span>{" "}
                <span className="text-blue-700">
                  {SERVER_PRESETS.ANDROID_EMULATOR}
                </span>
              </button>
            </div>
          </div>

          {status && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                status.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleTest()}
              disabled={testing}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${testing ? "animate-spin" : ""}`}
              />
              {testing ? "Testing..." : "Test"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={testing}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Save & Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServerSettingsModal;
