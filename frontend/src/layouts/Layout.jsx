import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Phone,
  Accessibility,
  Globe,
  Volume2,
  Mail,
  MapPin,
  ExternalLink,
  Shield,
  FileText,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  ChevronDown,
  User,
  LogOut,
  UserCircle,
  Settings,
  BarChart3,
  HelpCircle,
  Server,
  Home,
  PlusCircle,
  Map,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import Chatbot from "../components/common/Chatbot";

// Header Component (extracted from citizen seva)
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const location = useLocation();
  const languageDropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const { user, logout, openAuthModal, serverOnline, openServerSettings } =
    useAuth();
  const { language, setLanguage, t } = useLanguage();

  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast);
    document.documentElement.classList.toggle("high-contrast");
  };

  const toggleLargeText = () => {
    setIsLargeText(!isLargeText);
    document.documentElement.classList.toggle("large-text");
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिन्दी" },
    { code: "mr", name: "मराठी" },
    { code: "ta", name: "தமிழ்" },
    { code: "bn", name: "বাংলা" },
  ];

  const navItems = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.registerComplaint"), href: "/register-complaint" },
    { name: t("nav.heatmaps"), href: "/heatmaps" },
    { name: t("nav.faq"), href: "/faq" },
  ];

  // Helper function to get display name
  const getDisplayName = (username) => {
    if (!username) return "User";
    return username.replace(/@.*$/, "");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target)
      ) {
        setIsLanguageDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container mx-auto px-4">
        {/* Top bar with accessibility and language */}
        <div className="flex items-center justify-between py-2 text-sm border-b border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Government of India | भारत सरकार
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher Pill */}
            <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 p-0.5 text-xs">
              <Globe className="w-3 h-3 text-blue-600 ml-1.5 mr-1 hidden sm:inline" />
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2 py-0.5 rounded-full font-medium transition-colors ${
                  language === "en"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`px-2 py-0.5 rounded-full font-medium transition-colors ${
                  language === "hi"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Server Connection Status / Settings */}
            <button
              type="button"
              onClick={openServerSettings}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                serverOnline
                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 animate-pulse"
              }`}
              title="Configure backend server URL"
            >
              <Server className="w-3 h-3" />
              <span className="hidden sm:inline">
                {serverOnline ? t("common.connected") : t("common.offline")}
              </span>
            </button>

            {/* Helpline */}
            <div className="hidden sm:flex items-center gap-1 text-blue-600">
              <Phone className="w-3 h-3" />
              <span className="font-medium">1800-11-2345</span>
            </div>
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">सेवा</span>
            </div>
            <div>
              <Link to="/">
                <h1 className="text-xl font-bold text-blue-600">{t("common.appName")}</h1>
                <p className="text-xs text-gray-600">
                  {t("common.tagline")}
                </p>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Menu / Login */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {getDisplayName(user?.username)}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {getDisplayName(user?.username)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user?.username}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      {/* Role-based navigation */}
                      {user?.role === "admin" && (
                        <Link
                          to="/dashboard"
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <BarChart3 className="h-4 w-4 mr-3 text-gray-400" />
                          Admin Dashboard
                        </Link>
                      )}
                      {user?.role === "worker" && (
                        <Link
                          to="/worker"
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-3 text-gray-400" />
                          Worker Dashboard
                        </Link>
                      )}

                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <UserCircle className="h-4 w-4 mr-3 text-gray-400" />
                        View Profile
                      </button>
                      <Link
                        to="/my-complaints"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FileText className="h-4 w-4 mr-3 text-gray-400" />
                        My Complaints
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 my-1"></div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {t("nav.login")}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? "text-blue-600"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile User Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-md">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {getDisplayName(user?.username)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user?.username}
                        </p>
                      </div>
                    </div>
                    {user?.role === "admin" && (
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                      >
                        <BarChart3 className="h-4 w-4 mr-3 text-gray-400" />
                        Admin Dashboard
                      </Link>
                    )}
                    {user?.role === "worker" && (
                      <Link
                        to="/worker"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                      >
                        <Settings className="h-4 w-4 mr-3 text-gray-400" />
                        Worker Dashboard
                      </Link>
                    )}
                    <Link
                      to="/my-complaints"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      <FileText className="h-4 w-4 mr-3 text-gray-400" />
                      {t("nav.myComplaints")}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      {t("nav.signOut")}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      openAuthModal();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                  >
                    <User className="h-4 w-4 mr-3" />
                    {t("nav.login")} / {t("nav.register")}
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Footer Component (extracted from citizen seva)
const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Register Complaint", href: "/register-complaint" },
    { name: "FAQ", href: "/faq" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "#privacy", icon: Shield },
    { name: "Terms of Service", href: "#terms", icon: FileText },
    { name: "Accessibility Statement", href: "#accessibility", icon: Shield },
    { name: "RTI Portal", href: "#rti", icon: ExternalLink },
  ];

  const departments = [
    "Municipal Corporation",
    "Public Works Department",
    "Water Supply Department",
    "Electricity Board",
    "Police Department",
    "Health Department",
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#facebook" },
    { name: "Twitter", icon: Twitter, href: "#twitter" },
    { name: "YouTube", icon: Youtube, href: "#youtube" },
    { name: "Instagram", icon: Instagram, href: "#instagram" },
  ];

  return (
    <footer className="bg-blue-800 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Government Identity */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">SevaAI</h3>
                  <p className="text-sm text-white/80">भारत सरकार</p>
                </div>
              </div>

              <p className="text-white/90 text-sm mb-6 leading-relaxed">
                Empowering citizens through AI-powered municipal services.
                Building a smarter, more responsive governance system for
                Digital India.
              </p>

              {/* Trust Badges */}
              <div className="space-y-2">
                <div className="inline-flex items-center px-2 py-1 bg-white/10 text-white border border-white/20 rounded text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Government Verified
                </div>
                <br />
                <div className="inline-flex items-center px-2 py-1 bg-white/10 text-white border border-white/20 rounded text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Data Protected
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-white/80 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <h4 className="text-lg font-semibold mb-4 mt-8">Departments</h4>
              <ul className="space-y-2">
                {departments.slice(0, 4).map((dept) => (
                  <li key={dept}>
                    <span className="text-white/70 text-xs">{dept}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & Compliance */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Legal & Compliance</h4>
              <ul className="space-y-3">
                {legalLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
                      >
                        <Icon className="w-3 h-3" />
                        {link.name}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact & Support</h4>

              <div className="space-y-4">
                {/* Helpline */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">24/7 Helpline</p>
                    <p className="font-semibold">1800-11-2345</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Email Support</p>
                    <p className="font-semibold text-sm">
                      support@sevaai.gov.in
                    </p>
                  </div>
                </div>

                {/* Emergency */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Emergency</p>
                    <p className="font-semibold">100 / 102 / 108</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <h4 className="text-lg font-semibold mb-4 mt-8">Follow Us</h4>
              <div className="flex gap-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="w-8 h-8 p-0 border border-white/30 text-white hover:bg-white/10 rounded flex items-center justify-center transition-colors"
                    >
                      <Icon className="w-3 h-3" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span>© 2025 Government of India</span>
                <span>•</span>
                <span>All Rights Reserved</span>
                <span>•</span>
                <span>Last Updated: August 2025</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="px-2 py-1 bg-green-600/20 text-green-400 border border-green-500/30 rounded text-xs">
                  Website Secure
                </span>
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded text-xs">
                  SSL Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Mobile Bottom Navigation Bar
const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const personalRoute =
    user?.role === "admin"
      ? { name: "Admin", href: "/dashboard", icon: BarChart3 }
      : user?.role === "worker"
      ? { name: "Tasks", href: "/worker", icon: Settings }
      : { name: "My Issues", href: "/my-complaints", icon: FileText };

  const items = [
    { name: "Home", href: "/", icon: Home },
    { name: "Report", href: "/register-complaint", icon: PlusCircle },
    { name: "Heatmap", href: "/heatmaps", icon: Map },
    personalRoute,
    { name: "FAQ", href: "/faq", icon: HelpCircle },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 shadow-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                isActive
                  ? "text-blue-700"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-blue-700" : "text-gray-500"
                }`}
              />
              <span className="truncate max-w-full px-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

// Main Layout Component
const Layout = ({ children }) => {
  const { serverOnline, openServerSettings } = useAuth();

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      <Header />
      {!serverOnline && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between gap-2">
          <span>
            Cannot reach SevaAI backend server. Check Wi-Fi or configure server URL.
          </span>
          <button
            type="button"
            onClick={openServerSettings}
            className="px-2.5 py-1 bg-amber-600 text-white rounded font-medium whitespace-nowrap"
          >
            Server Settings
          </button>
        </div>
      )}
      <main className="flex-1">{children}</main>
      <Footer />
      <Chatbot />
      <MobileBottomNav />
    </div>
  );
};

export default Layout;
