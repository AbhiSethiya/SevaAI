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

// Hero Section Component
const HeroSection = () => {
  const { user, openAuthModal } = useAuth();
  const { openChatbot } = useChatbot();

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
                Speak. Serve.{" "}
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
                  Simplify
                </motion.span>
                <br />
                Municipal Services.
              </motion.h1>

              {/* Subheading */}
              <motion.p
                className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                Your AI-powered voice assistant for seamless government
                services. Report issues, track complaints, and access municipal
                services instantly in your preferred language.
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
                      Start Voice Service
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
                    Learn More
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
                <p>
                  💬 Say: "Report streetlight issue on MG Road" or "Track my
                  complaint"
                </p>
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
                  <p className="text-lg font-medium">Start Assistant</p>
                  <p className="text-sm opacity-80">
                    Click to open your AI municipal assistant
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
      title: "New Digital Water Bill Payment System",
      description:
        "Citizens can now pay water bills online through our new digital portal. No more standing in queues!",
      type: "Service Update",
      date: "2025-08-24",
      priority: "High",
      icon: Droplets,
      color: "bg-blue-100 text-blue-600 border-blue-200",
    },
    {
      id: 2,
      title: "Street Light Maintenance Drive",
      description:
        "City-wide street light maintenance will be conducted from August 26-30. Report any issues through voice assistant.",
      type: "Maintenance",
      date: "2025-08-23",
      priority: "Medium",
      icon: Lightbulb,
      color: "bg-yellow-100 text-yellow-600 border-yellow-200",
    },
    {
      id: 3,
      title: "Emergency Contact Numbers Updated",
      description:
        "New emergency helpline numbers are now active 24/7 for all municipal services and complaints.",
      type: "Important",
      date: "2025-08-22",
      priority: "Critical",
      icon: Phone,
      color: "bg-red-100 text-red-600 border-red-200",
    },
    {
      id: 4,
      title: "Waste Collection Schedule Changes",
      description:
        "Updated waste collection timings for residential areas. Check your zone's new schedule.",
      type: "Schedule",
      date: "2025-08-21",
      priority: "Medium",
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
              Latest Updates
            </motion.div>
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Municipal Announcements
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Stay informed about the latest updates, service changes, and
              important notifications from your municipal corporation.
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
                        announcement.priority
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
                    Read More
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
      title: "Birth & Death Certificates",
      description:
        "Apply for and download birth/death certificates online instantly",
      icon: FileText,
      features: ["Instant Download", "Digital Verification", "24/7 Available"],
      completionTime: "Same Day",
      color: "bg-green-100 text-green-600",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      id: 2,
      title: "Property Tax Payment",
      description: "Pay property taxes online with multiple payment options",
      icon: Bell,
      features: ["Online Payment", "Payment History", "Auto Reminders"],
      completionTime: "Instant",
      color: "bg-blue-100 text-blue-600",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      id: 3,
      title: "Trade License Application",
      description:
        "Apply for new trade licenses or renew existing ones digitally",
      icon: Award,
      features: ["Digital Application", "Status Tracking", "Document Upload"],
      completionTime: "7-15 Days",
      color: "bg-purple-100 text-purple-600",
      bgGradient: "from-purple-50 to-indigo-50",
    },
    {
      id: 4,
      title: "Water Connection Services",
      description: "Apply for new water connections or report service issues",
      icon: Droplets,
      features: ["New Connections", "Billing Support", "Quality Testing"],
      completionTime: "10-30 Days",
      color: "bg-blue-100 text-blue-600",
      bgGradient: "from-blue-50 to-teal-50",
    },
    {
      id: 5,
      title: "Building Plan Approval",
      description: "Submit and track building plan approvals for construction",
      icon: ExternalLink,
      features: ["Online Submission", "Approval Tracking", "Fee Calculation"],
      completionTime: "30-45 Days",
      color: "bg-orange-100 text-orange-600",
      bgGradient: "from-orange-50 to-yellow-50",
    },
    {
      id: 6,
      title: "Grievance Redressal",
      description: "File complaints and track resolution status in real-time",
      icon: HelpCircle,
      features: ["Voice Support", "Real-time Tracking", "SMS Updates"],
      completionTime: "3-7 Days",
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
              Essential Services
            </motion.div>
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Key Municipal Services
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Access all essential municipal services digitally. From
              certificates to licenses, everything you need is just a click
              away.
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
                    Access Service
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
  const stats = [
    {
      label: "Complaints Resolved",
      value: "15,234",
      change: "+12%",
      trend: "up",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Average Response Time",
      value: "4.2 hrs",
      change: "-18%",
      trend: "down",
      icon: Clock,
      color: "text-blue-600",
    },
    {
      label: "Carbon Footprint Saved",
      value: "2.3 tons",
      change: "+24%",
      trend: "up",
      icon: Leaf,
      color: "text-gray-600",
    },
    {
      label: "Active Citizens",
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
              Smart City Analytics
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Real-Time Impact Dashboard
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track our commitment to efficient governance and citizen
              satisfaction through transparent, real-time statistics.
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

// Main HomePage Component
const HomePage = () => {
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
