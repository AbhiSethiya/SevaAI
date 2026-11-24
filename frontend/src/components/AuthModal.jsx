import { useState, useEffect } from "react";
import { Globe, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import Login from "./Login";
import Register from "./Register";

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, openServerSettings, serverOnline } = useAuth();
  const {
    language,
    hasChosenLanguage,
    setLanguage,
    confirmLanguageChoice,
    t,
  } = useLanguage();

  // Start on language selection step if user hasn't chosen a language yet
  const [step, setStep] = useState(() =>
    hasChosenLanguage ? "auth" : "language"
  );

  useEffect(() => {
    if (isOpen) {
      setStep(hasChosenLanguage ? "auth" : "language");
    }
  }, [isOpen, hasChosenLanguage]);

  // Close modal when user is authenticated
  useEffect(() => {
    if (user) {
      onClose();
    }
  }, [user, onClose]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectLanguage = (lang) => {
    setLanguage(lang);
  };

  const handleContinueFromLanguage = () => {
    confirmLanguageChoice(language);
    setStep("auth");
  };

  const handleSkipGuest = () => {
    confirmLanguageChoice(language);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleSkipGuest}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[92vh] overflow-y-auto">
        {/* Step Progress Header */}
        <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
            <Globe className="w-3.5 h-3.5" />
            <span>
              {step === "language"
                ? t("languagePicker.step1")
                : t("languagePicker.step2")}
            </span>
          </div>

          <button
            onClick={handleSkipGuest}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1"
            aria-label={t("common.close")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {step === "language" ? (
          /* STEP 1: LANGUAGE SELECTION */
          <div className="p-6 space-y-5">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                सेवा
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {t("languagePicker.bilingualTitle")}
              </h2>
              <p className="text-sm text-gray-500">
                {t("languagePicker.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* English Card */}
              <button
                type="button"
                onClick={() => handleSelectLanguage("en")}
                className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                  language === "en"
                    ? "border-blue-600 bg-blue-50/70 shadow-sm"
                    : "border-gray-200 hover:border-blue-300 bg-white"
                }`}
              >
                <div>
                  <div className="font-bold text-gray-900 text-base">
                    English
                  </div>
                  <div className="text-xs text-gray-500">
                    Continue in English
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    language === "en"
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {language === "en" && <Check className="w-4 h-4" />}
                </div>
              </button>

              {/* Hindi Card */}
              <button
                type="button"
                onClick={() => handleSelectLanguage("hi")}
                className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                  language === "hi"
                    ? "border-blue-600 bg-blue-50/70 shadow-sm"
                    : "border-gray-200 hover:border-blue-300 bg-white"
                }`}
              >
                <div>
                  <div className="font-bold text-gray-900 text-base">
                    हिन्दी (Hindi)
                  </div>
                  <div className="text-xs text-gray-500">
                    हिन्दी में जारी रखें
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    language === "hi"
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {language === "hi" && <Check className="w-4 h-4" />}
                </div>
              </button>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleContinueFromLanguage}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition-colors"
              >
                <span>{t("languagePicker.continueBtn")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleSkipGuest}
                className="w-full text-center text-xs text-gray-500 hover:text-gray-700 py-1.5"
              >
                {t("common.skipGuest")}
              </button>
            </div>

            <p className="text-[11px] text-center text-gray-400">
              {t("languagePicker.switchHint")}
            </p>
          </div>
        ) : (
          /* STEP 2: LOGIN / REGISTER */
          <>
            {/* Quick Language Back/Toggle Bar */}
            <div className="px-6 pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep("language")}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t("common.changeLanguage")}</span>
              </button>

              <div className="inline-flex rounded-md border border-gray-200 overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-2 py-0.5 font-medium transition-colors ${
                    language === "en"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("hi")}
                  className={`px-2 py-0.5 font-medium transition-colors ${
                    language === "hi"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            {/* Auth Toggle */}
            <div className="p-6 pb-0 pt-3">
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    isLogin
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setIsLogin(true)}
                >
                  {t("auth.loginTab")}
                </button>
                <button
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    !isLogin
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setIsLogin(false)}
                >
                  {t("auth.registerTab")}
                </button>
              </div>
            </div>

            {/* Auth Forms */}
            <div className="pb-4">{isLogin ? <Login /> : <Register />}</div>
          </>
        )}

        {/* Server Settings Link */}
        <div className="px-6 pb-5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                serverOnline ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {serverOnline
              ? t("auth.serverConnected")
              : t("auth.serverUnreachable")}
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              openServerSettings();
            }}
            className="text-blue-600 hover:underline font-medium"
          >
            {t("auth.serverSettings")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
