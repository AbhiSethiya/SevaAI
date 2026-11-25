import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Shield,
  FileText,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  Accessibility,
  Globe,
  Volume2,
  Menu,
  X,
  Mic,
  MicOff,
  Play,
  Pause,
  Zap,
  Users,
  Lightbulb,
  Trash2,
  Droplets,
  Brush,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Leaf,
  BarChart3,
  Award,
  Bell,
  Megaphone,
  HelpCircle,
} from "lucide-react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { useAuth } from "../contexts/AuthContext";
import { useChatbot } from "../contexts/ChatbotContext";
import { useLanguage } from "../contexts/LanguageContext";
import { isNativeApp } from "../lib/config";

// Hero Section Component
const HeroSection = () => {
  const { user, openAuthModal } = useAuth();
  const { openChatbot } = useChatbot();
  const { t } = useLanguage();

  const handleVoiceToggle = () => {
    if (!user) {
      openAuthModal();
      return;
    }

    // Open the chatbot that's positioned at bottom right
    openChatbot();
  };

  return (
    <motion.section
      id="home"
      className="relative min-h-screen flex items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-600 to-green-600 opacity-95"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url('/hero-img.jpg')` }}
      />

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              className="text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Main Heading */}
              <motion.h1
                className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                {t("hero.titlePrefix")}{" "}
                <motion.span
                  className="text-orange-400"
                  animate={{
                    scale: [1, 1.05, 1],
                    textShadow: [
                      "0 0 10px rgba(251, 146, 60, 0)",
                      "0 0 20px rgba(251, 146, 60, 0.8)",
                      "0 0 10px rgba(251, 146, 60, 0)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {t("hero.titleHighlight")}
                </motion.span>
                <br />
                {t("hero.titleSuffix")}
              </motion.h1>

              {/* Subheading */}
              <motion.p
                className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                {t("hero.subtitle")}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                <Link to="/register-complaint">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      size="lg"
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-6 text-lg w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow"
                    >
                      {t("hero.startVoice")}
                    </Button>
                  </motion.div>
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg w-full sm:w-auto backdrop-blur-sm"
                  >
                    {t("hero.learnMore")}
                  </Button>
                </motion.div>
              </motion.div>

              {/* Voice Instructions */}
              <motion.div
                className="text-white/80 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.1 }}
              >
                <p>{t("hero.voiceHint")}</p>
              </motion.div>
            </motion.div>

            {/* Right Column - Voice Interface */}
            <motion.div
              className="flex flex-col items-center space-y-8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {/* Main Voice Button */}
              <motion.div
                className="relative z-10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                  delay: 1,
                }}
              >
                <motion.button
                  onClick={handleVoiceToggle}
                  className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-500/20 z-20 cursor-pointer"
                  style={{ pointerEvents: "auto" }}
                  whileHover={{
                    scale: 1.1,
                    boxShadow: "0 20px 40px rgba(251, 146, 60, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      "0 10px 20px rgba(251, 146, 60, 0.2)",
                      "0 15px 30px rgba(251, 146, 60, 0.4)",
                      "0 10px 20px rgba(251, 146, 60, 0.2)",
                    ],
                  }}
                  transition={{
                    boxShadow: { duration: 2, repeat: Infinity },
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 2 }}
                  >
                    <Mic className="w-8 h-8 text-white" />
                  </motion.div>
                </motion.button>

                {/* Pulsing rings */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-orange-300"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.8, 0, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-orange-200"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.3,
                  }}
                />
              </motion.div>

              {/* Status Text */}
              <motion.div
                className="text-center text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
              >
                <motion.div
                  className="space-y-2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <p className="text-lg font-medium">{t("homeSections.startAssistant")}</p>
                  <p className="text-sm opacity-80">
                    {t("homeSections.startAssistantSub")}
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

// Announcements Section Component
const AnnouncementsSection = () => {
  const { t } = useLanguage();
  const translatedAnnouncements = t("homeSections.announcements") || [];
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const announcements = [
    {
      id: 1,
      title: translatedAnnouncements[0]?.title || "New Digital Water Bill Payment System",
      description:
        translatedAnnouncements[0]?.description ||
        "Citizens can now pay water bills online through our new digital portal. No more standing in queues!",
      type: translatedAnnouncements[0]?.type || "Service Update",
      date: "2025-08-24",
      priority: translatedAnnouncements[0]?.priority || "High",
      priorityLevel: "High",
      icon: Droplets,
      color: "bg-blue-100 text-blue-600 border-blue-200",
    },
    {
      id: 2,
      title: translatedAnnouncements[1]?.title || "Street Light Maintenance Drive",
      description:
        translatedAnnouncements[1]?.description ||
        "City-wide street light maintenance will be conducted from August 26-30. Report any issues through voice assistant.",
      type: translatedAnnouncements[1]?.type || "Maintenance",
      date: "2025-08-23",
      priority: translatedAnnouncements[1]?.priority || "Medium",
      priorityLevel: "Medium",
      icon: Lightbulb,
      color: "bg-yellow-100 text-yellow-600 border-yellow-200",
    },
    {
      id: 3,
      title: translatedAnnouncements[2]?.title || "Emergency Contact Numbers Updated",
      description:
        translatedAnnouncements[2]?.description ||
        "New emergency helpline numbers are now active 24/7 for all municipal services and complaints.",
      type: translatedAnnouncements[2]?.type || "Important",
      date: "2025-08-22",
      priority: translatedAnnouncements[2]?.priority || "Critical",
      priorityLevel: "Critical",
      icon: Phone,
      color: "bg-red-100 text-red-600 border-red-200",
    },
    {
      id: 4,
      title: translatedAnnouncements[3]?.title || "Waste Collection Schedule Changes",
      description:
        translatedAnnouncements[3]?.description ||
        "Updated waste collection timings for residential areas. Check your zone's new schedule.",
      type: translatedAnnouncements[3]?.type || "Schedule",
      date: "2025-08-21",
      priority: translatedAnnouncements[3]?.priority || "Medium",
      priorityLevel: "Medium",
      icon: Trash2,
      color: "bg-green-100 text-green-600 border-green-200",
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-600 text-white";
      case "High":
        return "bg-orange-600 text-white";
      case "Medium":
        return "bg-blue-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.section
      className="py-16 bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700  text-white text-sm font-medium mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Megaphone className="w-4 h-4" />
              </motion.div>
              {t("homeSections.latestUpdates")}
            </motion.div>
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t("homeSections.announcementsTitle")}
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {t("homeSections.announcementsSub")}
            </motion.p>
          </motion.div>

          {/* Announcements Grid */}
          <motion.div
            className="grid md:grid-cols-2 gap-6"
            variants={containerVariants}
          >
            {announcements.map((announcement, index) => {
              const Icon = announcement.icon;
              return (
                <motion.div
                  key={announcement.id}
                  className="p-6 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm"
                  variants={itemVariants}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    transition: { duration: 0.2 },
                  }}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${announcement.color}`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>
                      <div>
                        <motion.span
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          {announcement.type}
                        </motion.span>
                        <motion.p
                          className="text-xs text-gray-500 mt-1"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          {formatDate(announcement.date)}
                        </motion.p>
                      </div>
                    </div>
                    <motion.span
                      className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                        announcement.priorityLevel
                      )}`}
                      whileHover={{ scale: 1.05 }}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      {announcement.priority}
                    </motion.span>
                  </div>

                  {/* Content */}
                  <motion.h3
                    className="text-lg font-semibold text-gray-900 mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {announcement.title}
                  </motion.h3>
                  <motion.p
                    className="text-sm text-gray-600 mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {announcement.description}
                  </motion.p>

                  {/* Action Button */}
                  <motion.button
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 group"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {t("homeSections.readMore")}
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

// Key Services Section Component
const KeyServicesSection = () => {
  const { t } = useLanguage();
  const translatedServices = t("homeSections.services") || [];
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const keyServices = [
    {
      id: 1,
      title: translatedServices[0]?.title || "Birth & Death Certificates",
      description:
        translatedServices[0]?.description ||
        "Apply for and download birth/death certificates online instantly",
      icon: FileText,
      features: translatedServices[0]?.features || ["Instant Download", "Digital Verification", "24/7 Available"],
      completionTime: translatedServices[0]?.completionTime || "Same Day",
      color: "bg-green-100 text-green-600",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      id: 2,
      title: translatedServices[1]?.title || "Property Tax Payment",
      description:
        translatedServices[1]?.description ||
        "Pay property taxes online with multiple payment options",
      icon: Bell,
      features: translatedServices[1]?.features || ["Online Payment", "Payment History", "Auto Reminders"],
      completionTime: translatedServices[1]?.completionTime || "Instant",
      color: "bg-blue-100 text-blue-600",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      id: 3,
      title: translatedServices[2]?.title || "Trade License Application",
      description:
        translatedServices[2]?.description ||
        "Apply for new trade licenses or renew existing ones digitally",
      icon: Award,
      features: translatedServices[2]?.features || ["Digital Application", "Status Tracking", "Document Upload"],
      completionTime: translatedServices[2]?.completionTime || "7-15 Days",
      color: "bg-purple-100 text-purple-600",
      bgGradient: "from-purple-50 to-indigo-50",
    },
    {
      id: 4,
      title: translatedServices[3]?.title || "Water Connection Services",
      description:
        translatedServices[3]?.description ||
        "Apply for new water connections or report service issues",
      icon: Droplets,
      features: translatedServices[3]?.features || ["New Connections", "Billing Support", "Quality Testing"],
      completionTime: translatedServices[3]?.completionTime || "10-30 Days",
      color: "bg-blue-100 text-blue-600",
      bgGradient: "from-blue-50 to-teal-50",
    },
    {
      id: 5,
      title: translatedServices[4]?.title || "Building Plan Approval",
      description:
        translatedServices[4]?.description ||
        "Submit and track building plan approvals for construction",
      icon: ExternalLink,
      features: translatedServices[4]?.features || ["Online Submission", "Approval Tracking", "Fee Calculation"],
      completionTime: translatedServices[4]?.completionTime || "30-45 Days",
      color: "bg-orange-100 text-orange-600",
      bgGradient: "from-orange-50 to-yellow-50",
    },
    {
      id: 6,
      title: translatedServices[5]?.title || "Grievance Redressal",
      description:
        translatedServices[5]?.description ||
        "File complaints and track resolution status in real-time",
      icon: HelpCircle,
      features: translatedServices[5]?.features || ["Voice Support", "Real-time Tracking", "SMS Updates"],
      completionTime: translatedServices[5]?.completionTime || "3-7 Days",
      color: "bg-red-100 text-red-600",
      bgGradient: "from-red-50 to-pink-50",
    },
  ];

  return (
    <motion.section
      className="py-20 bg-gray-50"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <Shield className="w-4 h-4" />
              </motion.div>
              {t("homeSections.essentialServices")}
            </motion.div>
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t("homeSections.keyServicesTitle")}
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {t("homeSections.keyServicesSub")}
            </motion.p>
          </motion.div>

          {/* Services Grid */}
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            {keyServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  className={`p-6 rounded-xl border border-gray-200 bg-gradient-to-br ${service.bgGradient} shadow-sm cursor-pointer group`}
                  variants={itemVariants}
                  whileHover={{
                    y: -8,
                    boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                    transition: { duration: 0.3 },
                  }}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${service.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs px-2 py-1 bg-white/80 text-gray-600 rounded">
                        {service.completionTime}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    {service.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-gray-600"
                      >
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <motion.button
                    className="w-full bg-white/80 hover:bg-white text-gray-700 hover:text-blue-600 py-2 px-4 rounded-lg border border-gray-200 flex items-center justify-center gap-2 group-hover:border-blue-300 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t("homeSections.accessService")}
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

// Stats Section Component
const StatsSection = () => {
  const { t } = useLanguage();
  const stats = [
    {
      label: t("homeSections.statResolved"),
      value: "15,234",
      change: "+12%",
      trend: "up",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: t("homeSections.statResponse"),
      value: "4.2 hrs",
      change: "-18%",
      trend: "down",
      icon: Clock,
      color: "text-blue-600",
    },
    {
      label: t("homeSections.statCarbon"),
      value: "2.3 tons",
      change: "+24%",
      trend: "up",
      icon: Leaf,
      color: "text-gray-600",
    },
    {
      label: t("homeSections.statCitizens"),
      value: "45,678",
      change: "+15%",
      trend: "up",
      icon: Users,
      color: "text-orange-600",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white to-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium mb-4">
              {t("homeSections.analyticsBadge")}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("homeSections.impactTitle")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("homeSections.impactSub")}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="text-center p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${stat.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        stat.trend === "up"
                          ? "bg-green-100 text-green-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <TrendingUp
                        className={`w-3 h-3 ${
                          stat.trend === "down" ? "rotate-180" : ""
                        }`}
                      />
                      {stat.change}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {stat.value}
                    </h3>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

// Simple Action-First Android App Home Screen
const AndroidHome = () => {
  const { user, openAuthModal } = useAuth();
  const { openChatbot } = useChatbot();
  const { t } = useLanguage();

  const displayName = user?.username
    ? user.username.replace(/@.*$/, "")
    : null;

  const handleVoicePress = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    openChatbot();
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-slate-50 px-4 pt-4 pb-8 space-y-4 select-none">
      {/* Greeting Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">
          {displayName
            ? `${t("appHome.greeting")}, ${displayName}!`
            : t("appHome.welcomeTitle")}
        </h2>
        <p className="text-sm text-gray-600 mt-0.5">
          {t("appHome.welcomeSub")}
        </p>
        {!user && (
          <button
            type="button"
            onClick={openAuthModal}
            className="mt-3 w-full py-2.5 px-4 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm border border-blue-200 active:scale-[0.99] transition-transform"
          >
            {t("appHome.loginPrompt")} →
          </button>
        )}
      </div>

      {/* Primary Big Action: Speak / Voice AI */}
      <button
        type="button"
        onClick={handleVoicePress}
        className="w-full text-left bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-5 shadow-lg active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shrink-0 shadow-md">
            <Mic className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold leading-snug">
              {t("appHome.voiceCardTitle")}
            </h3>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed">
              {t("appHome.voiceCardSub")}
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-blue-200 shrink-0" />
        </div>
      </button>

      {/* 2x2 Simple Action Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/register-complaint"
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform flex flex-col gap-2.5"
        >
          <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm leading-tight">
              {t("appHome.reportTitle")}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {t("appHome.reportSub")}
            </p>
          </div>
        </Link>

        <Link
          to="/my-complaints"
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform flex flex-col gap-2.5"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm leading-tight">
              {t("appHome.myIssuesTitle")}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {t("appHome.myIssuesSub")}
            </p>
          </div>
        </Link>

        <Link
          to="/heatmaps"
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform flex flex-col gap-2.5"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm leading-tight">
              {t("appHome.mapTitle")}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {t("appHome.mapSub")}
            </p>
          </div>
        </Link>

        <Link
          to="/faq"
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform flex flex-col gap-2.5"
        >
          <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm leading-tight">
              {t("appHome.faqTitle")}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {t("appHome.faqSub")}
            </p>
          </div>
        </Link>
      </div>

      {/* Tap-to-call Helpline Card */}
      <a
        href="tel:1800112345"
        className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">{t("appHome.helplineLabel")}</p>
            <p className="text-sm font-bold text-gray-900">1800-11-2345</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </a>
    </div>
  );
};

// Main HomePage Component
const HomePage = () => {
  if (isNativeApp()) {
    return <AndroidHome />;
  }

  return (
    <>
      <HeroSection />
      <StatsSection />
      <AnnouncementsSection />
      <KeyServicesSection />
    </>
  );
};

export default HomePage;
