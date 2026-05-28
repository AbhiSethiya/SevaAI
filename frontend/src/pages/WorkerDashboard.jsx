import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Camera,
  CheckCircle,
  Clock,
  FileText,
  Upload,
  Phone,
  AlertCircle,
  Calendar,
  User,
  LogOut,
  Bell,
  ChevronDown,
  ChevronRight,
  Eye,
  Star,
  Zap,
  Route,
  ExternalLink,
  TrendingUp,
  Award,
  Target,
  Activity,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Textarea from "../components/common/Textarea";
import { workerAPI } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const statsVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const slideVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const WorkerPage = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [completionPhotos, setCompletionPhotos] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [showAllComplaints, setShowAllComplaints] = useState(false);
  const [selectedComplaintDetails, setSelectedComplaintDetails] =
    useState(null);
  const [workerStatus, setWorkerStatus] = useState("available");
  const { user, logout } = useAuth();

  // Helper function to get display name (remove everything after @)
  const getDisplayName = (username) => {
    if (!username) return "Worker";
    return username.replace(/@.*$/, "");
  };

  // Helper function to format department name
  const formatDepartment = (department) => {
    if (!department || department === "other") return "General Department";

    const departmentMap = {
      road: "Road Department",
      water: "Water Department",
      electricity: "Electricity Department",
      waste: "Waste Management Department",
      drainage: "Drainage Department",
    };

    return (
      departmentMap[department] ||
      `${department.charAt(0).toUpperCase() + department.slice(1)} Department`
    );
  };

  // Helper function to get status display info
  const getStatusInfo = (status) => {
    switch (status) {
      case "available":
        return {
          color: "green",
          label: "Online",
          bgColor: "bg-green-50",
          textColor: "text-green-700",
          dotColor: "bg-green-500",
        };
      case "busy":
        return {
          color: "yellow",
          label: "Busy",
          bgColor: "bg-yellow-50",
          textColor: "text-yellow-700",
          dotColor: "bg-yellow-400",
        };
      case "offline":
        return {
          color: "gray",
          label: "Offline",
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
          dotColor: "bg-gray-400",
        };
      default:
        return {
          color: "green",
          label: "Online",
          bgColor: "bg-green-50",
          textColor: "text-green-700",
          dotColor: "bg-green-500",
        };
    }
  };

  // Update worker status
  const updateWorkerStatus = async (newStatus) => {
    try {
      const response = await fetch(
        `/api/workers/status/${user._id || user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ workStatus: newStatus }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setWorkerStatus(newStatus);
        setDropdownOpen(null);
      } else {
        console.error("Failed to update status:", result.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Debug user object
  console.log("Current user object:", user);
  console.log("User department:", user?.department);
  console.log(
    "Formatted department:",
    user?.department ? formatDepartment(user.department) : "No department"
  );

  // Fetch worker dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await workerAPI.getWorkerDashboard();
        if (response.success) {
          console.log("Dashboard data received:", response.data);
          console.log("Assigned complaints:", response.data.assignedComplaints);
          setDashboardData(response.data);
          // Set initial worker status from user data
          if (user?.workStatus) {
            setWorkerStatus(user.workStatus);
          }
        } else {
          setError("Failed to load dashboard data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.workStatus]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".relative")) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const assignedComplaints = dashboardData?.assignedComplaints || [];

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "assigned":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-primary-100 text-primary-700";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      // Legacy support for old status values
      case "completed":
        return "bg-green-100 text-green-800";
      case "denied":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const updateStatus = async (complaintId, newStatus) => {
    try {
      const formData = new FormData();
      formData.append("status", newStatus);
      if (statusUpdate) {
        formData.append("workerNotes", statusUpdate);
      }

      const response = await fetch(
        `/api/workers/complaint/${complaintId}/status`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        // Refresh dashboard data
        const updatedResponse = await workerAPI.getWorkerDashboard();
        if (updatedResponse.success) {
          setDashboardData(updatedResponse.data);
        }
        setStatusUpdate("");
      } else {
        alert(result.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  const handlePhotoUpload = (e) => {
    const newFiles = Array.from(e.target.files);

    // Validate file types
    const validFiles = newFiles.filter((file) =>
      file.type.startsWith("image/")
    );
    if (validFiles.length !== newFiles.length) {
      alert("Please select only image files");
      return;
    }

    // Validate file size (max 5MB per file)
    const validSizeFiles = validFiles.filter(
      (file) => file.size <= 5 * 1024 * 1024
    );
    if (validSizeFiles.length !== validFiles.length) {
      alert("Please select files smaller than 5MB");
      return;
    }

    setCompletionPhotos((prev) => [...prev, ...validSizeFiles]);
  };

  const removePhoto = (index) => {
    setCompletionPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const markAsCompleted = async (complaintId) => {
    if (completionPhotos.length === 0) {
      alert(
        "Please upload at least one completion photo before marking as completed."
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("status", "resolved");
      formData.append("workerNotes", statusUpdate);

      // Append photos to form data
      completionPhotos.forEach((photo, index) => {
        formData.append("completionPhotos", photo);
      });

      const response = await fetch(
        `/api/workers/complaint/${complaintId}/status`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        // Refresh dashboard data
        const updatedResponse = await workerAPI.getWorkerDashboard();
        if (updatedResponse.success) {
          setDashboardData(updatedResponse.data);
        }
        setCompletionPhotos([]);
        setStatusUpdate("");
        setSelectedComplaint(null);
        alert("Complaint marked as completed successfully!");
      } else {
        alert(result.message || "Failed to mark complaint as completed");
      }
    } catch (err) {
      console.error("Error marking as completed:", err);
      alert("Failed to mark complaint as completed");
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background-light"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Professional Header */}
      <motion.header
        className="bg-background shadow-sm border-b border-gray-200 sticky top-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">सेवा</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-blue-600">
                        SevaAI
                      </h1>
                      <p className="text-xs text-gray-600">
                        Voice-Based Municipal Assistant
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg text-text-light hover:text-text hover:bg-gray-50 transition-colors duration-200"></button>

              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-text">
                    {getDisplayName(user?.fullName || user?.username)}
                  </p>
                  <p className="text-xs text-text-light">
                    {formatDepartment(user?.department)}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-text-light hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.div className="py-8" variants={itemVariants}>
        <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dashboard Header */}
          <motion.div className="mb-8" variants={itemVariants}>
            <motion.div
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div>
                <h1 className="text-3xl font-bold text-text">
                  Worker Dashboard
                </h1>
                <p className="text-text-light mt-1">
                  Welcome, {getDisplayName(user?.fullName || user?.username)} •{" "}
                  {formatDepartment(user?.department)}
                </p>
              </div>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {(() => {
                  const statusInfo = getStatusInfo(workerStatus);
                  return (
                    <>
                      <button
                        className={`flex items-center space-x-2 px-3 py-2 ${statusInfo.bgColor} rounded-lg border border-${statusInfo.color}-200 focus:outline-none`}
                        onClick={() =>
                          setDropdownOpen(
                            dropdownOpen === "status" ? null : "status"
                          )
                        }
                      >
                        <div
                          className={`w-2 h-2 ${statusInfo.dotColor} rounded-full`}
                        ></div>
                        <span
                          className={`text-sm font-medium ${statusInfo.textColor}`}
                        >
                          {statusInfo.label}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 ${statusInfo.textColor}`}
                        />
                      </button>
                      {dropdownOpen === "status" && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            className="flex items-center w-full px-3 py-2 text-sm text-green-700 hover:bg-green-50 focus:outline-none"
                            onClick={() => updateWorkerStatus("available")}
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Online
                          </button>
                          <button
                            className="flex items-center w-full px-3 py-2 text-sm text-yellow-700 hover:bg-yellow-50 focus:outline-none"
                            onClick={() => updateWorkerStatus("busy")}
                          >
                            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                            Busy
                          </button>
                          <button
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
                            onClick={() => updateWorkerStatus("offline")}
                          >
                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                            Offline
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </motion.div>
            </motion.div>

            {/* Loading State */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  className="flex items-center justify-center h-64"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error State */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <div className="text-center text-red-600">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.2,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                      </motion.div>
                      <p className="text-lg font-medium">
                        Error Loading Dashboard
                      </p>
                      <p className="text-sm text-text-light">{error}</p>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => window.location.reload()}
                          className="mt-4"
                        >
                          Try Again
                        </Button>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Stats Grid */}
          <AnimatePresence>
            {dashboardData && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: 0.1 }}
              >
                <motion.div
                  variants={statsVariants}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                >
                  <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <motion.div
                          className="p-2 rounded-lg bg-amber-100 mr-3"
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                          }}
                        >
                          <Clock className="h-5 w-5 text-amber-600" />
                        </motion.div>
                        <div>
                          <p className="text-xs text-amber-600 font-medium">
                            Active Tasks
                          </p>
                          <p className="text-xl font-bold text-amber-700">
                            {dashboardData.statistics?.activeComplaints || 0}
                          </p>
                        </div>
                      </div>
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                    </div>
                  </Card>
                </motion.div>

                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-blue-100 mr-3">
                        <Zap className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 font-medium">
                          In Progress
                        </p>
                        <p className="text-xl font-bold text-blue-700">
                          {
                            assignedComplaints.filter(
                              (c) => c.status === "in-progress"
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                    <Activity className="h-4 w-4 text-blue-500" />
                  </div>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-green-100 mr-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-medium">
                          Completed
                        </p>
                        <p className="text-xl font-bold text-green-700">
                          {dashboardData.statistics?.completedToday || 0}
                        </p>
                      </div>
                    </div>
                    <Target className="h-4 w-4 text-green-500" />
                  </div>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-purple-100 mr-3">
                        <Star className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-purple-600 font-medium">
                          Rating
                        </p>
                        <p className="text-xl font-bold text-purple-700">4.8</p>
                      </div>
                    </div>
                    <Award className="h-4 w-4 text-purple-500" />
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Complaints Section */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Assigned Complaints
                </h2>
                <div className="flex items-center space-x-2">
                  {assignedComplaints.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllComplaints(!showAllComplaints)}
                    >
                      {showAllComplaints
                        ? "Show Less"
                        : `View All (${assignedComplaints.length})`}
                      <ChevronDown
                        className={`h-4 w-4 ml-1 transition-transform ${
                          showAllComplaints ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  )}
                </div>
              </div>

              {!loading && assignedComplaints.length === 0 ? (
                <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-1">
                    All caught up!
                  </h3>
                  <p className="text-gray-500">
                    No complaints assigned at the moment
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(showAllComplaints
                    ? assignedComplaints
                    : assignedComplaints.slice(0, 2)
                  ).map((complaint) => (
                    <div
                      key={complaint._id}
                      className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                    >
                      {/* Compact Complaint Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                                complaint.priority?.toLowerCase() || "medium"
                              )}`}
                            >
                              {(complaint.priority || "MEDIUM").toUpperCase()}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                complaint.status
                              )}`}
                            >
                              {complaint.status.replace("-", " ").toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                              #{complaint.ticketId}
                            </span>
                          </div>

                          <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1">
                            {complaint.refinedText || complaint.rawText}
                          </h3>

                          <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-24">
                                {complaint.locationName || "Location TBD"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(
                                  complaint.assignedAt || complaint.createdAt
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span className="truncate max-w-20">
                                {complaint.userId?.fullName?.split(" ")[0] ||
                                  complaint.userId?.username?.split("@")[0] ||
                                  "Anonymous"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 ml-3">
                          {/* Move Start/Done button to left, Eye button to right */}
                          {complaint.status === "assigned" && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() =>
                                updateStatus(complaint._id, "in-progress")
                              }
                              className="px-2 py-1 text-xs mr-2"
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Start
                            </Button>
                          )}

                          {complaint.status === "in-progress" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                setSelectedComplaint(
                                  selectedComplaint?._id === complaint._id
                                    ? null
                                    : complaint
                                )
                              }
                              className="px-2 py-1 text-xs mr-2"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Done
                            </Button>
                          )}

                          <div className="flex-1" />
                          <button
                            onClick={() =>
                              setSelectedComplaintDetails(
                                selectedComplaintDetails === complaint._id
                                  ? null
                                  : complaint._id
                              )
                            }
                            className="flex items-center px-2 py-1 text-xs text-gray-600 hover:text-primary focus:outline-none"
                            style={{ background: "none", border: "none" }}
                          >
                            <Eye
                              className="h-3 w-3"
                              style={{ border: "none" }}
                            />
                            <ChevronRight
                              className={`h-3 w-3 ml-1 transition-transform ${
                                selectedComplaintDetails === complaint._id
                                  ? "rotate-90"
                                  : ""
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {selectedComplaintDetails === complaint._id && (
                        <div className="border-t border-gray-200 p-6 pt-4 mt-3">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Left Column - Details */}
                            <div className="space-y-3">
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <h4 className="font-medium text-gray-800 mb-2 text-sm">
                                  Complaint Details
                                </h4>
                                <div className="space-y-2 text-xs">
                                  <div>
                                    <span className="font-medium text-gray-600">
                                      Department:
                                    </span>
                                    <p className="text-gray-800">
                                      {complaint.department}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-600">
                                      Description:
                                    </span>
                                    <p className="text-gray-800 leading-relaxed">
                                      {complaint.refinedText ||
                                        complaint.rawText}
                                    </p>
                                  </div>
                                  {complaint.rawText &&
                                    complaint.refinedText && (
                                      <div>
                                        <span className="font-medium text-gray-600">
                                          Original:
                                        </span>
                                        <p className="text-gray-500 italic text-xs">
                                          {complaint.rawText}
                                        </p>
                                      </div>
                                    )}
                                </div>
                              </div>

                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <h4 className="font-medium text-gray-800 mb-2 text-sm">
                                  Citizen Contact
                                </h4>
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-600">
                                      Name:
                                    </span>
                                    <span className="text-gray-800">
                                      {complaint.userId?.fullName ||
                                        complaint.userId?.username ||
                                        "Not provided"}
                                    </span>
                                  </div>
                                  {complaint.userId?.phone && (
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-600">
                                        Phone:
                                      </span>
                                      <div className="flex items-center space-x-1">
                                        <span className="text-gray-800">
                                          {complaint.userId.phone}
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            window.open(
                                              `tel:${complaint.userId.phone}`
                                            )
                                          }
                                          className="p-1"
                                        >
                                          <Phone className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                  {complaint.userId?.email && (
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-600">
                                        Email:
                                      </span>
                                      <span className="text-gray-800 text-xs truncate max-w-32">
                                        {complaint.userId.email}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right Column - Map */}
                            <div className="bg-white rounded-lg p-3 border border-gray-100">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-800 text-sm">
                                  Location
                                </h4>
                                {complaint.coordinates && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const url = `https://www.google.com/maps/dir/?api=1&destination=${complaint.coordinates.lat},${complaint.coordinates.lng}`;
                                      window.open(url, "_blank");
                                    }}
                                    className="p-1 text-xs"
                                  >
                                    <Route className="h-3 w-3 mr-1" />
                                    Navigation
                                  </Button>
                                )}
                              </div>
                              {complaint.coordinates ? (
                                <div className="space-y-2">
                                  <div className="h-52 rounded-lg overflow-hidden border border-gray-200 relative z-10">
                                    <MapContainer
                                      center={[
                                        complaint.coordinates.lat,
                                        complaint.coordinates.lng,
                                      ]}
                                      zoom={15}
                                      style={{
                                        height: "100%",
                                        width: "100%",
                                        zIndex: 10,
                                      }}
                                    >
                                      <TileLayer
                                        attribution="&copy; Google Maps"
                                        url="http://mt.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                                      />
                                      <Marker
                                        position={[
                                          complaint.coordinates.lat,
                                          complaint.coordinates.lng,
                                        ]}
                                      >
                                        <Popup>
                                          <div>
                                            <strong>
                                              {complaint.refinedText ||
                                                complaint.rawText}
                                            </strong>
                                            <br />
                                            {complaint.locationName && (
                                              <span>
                                                {complaint.locationName}
                                              </span>
                                            )}
                                          </div>
                                        </Popup>
                                      </Marker>
                                    </MapContainer>
                                  </div>
                                  <p className="text-xs font-medium text-primary truncate">
                                    {complaint.locationName ||
                                      "Complaint Location"}
                                  </p>
                                </div>
                              ) : (
                                <div className="h-32 bg-primary-50 rounded-lg border-2 border-dashed border-primary-200 flex items-center justify-center">
                                  <div className="text-center">
                                    <MapPin className="h-6 w-6 text-primary mx-auto mb-1" />
                                    <p className="text-primary font-medium text-xs">
                                      {complaint.locationName ||
                                        "Location not available"}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Complete Work Form */}
                      {selectedComplaint?._id === complaint._id &&
                        complaint.status === "in-progress" && (
                          <div className="border-t border-gray-200 pt-4 mt-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                            <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              Complete Work
                            </h4>
                            <div className="space-y-4">
                              <Textarea
                                label="Work Completion Summary"
                                value={statusUpdate}
                                onChange={(e) =>
                                  setStatusUpdate(e.target.value)
                                }
                                placeholder="Describe the work completed..."
                                rows={3}
                                className="text-sm"
                              />

                              <div>
                                <label className="block text-sm font-medium text-gray-800 mb-2">
                                  Completion Photos{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors bg-white">
                                  <Camera className="h-6 w-6 text-green-500 mx-auto mb-2" />
                                  <p className="text-gray-600 text-sm mb-2">
                                    Upload completion photos
                                  </p>
                                  <p className="text-gray-500 text-xs mb-3">
                                    Max 5 photos, 5MB each
                                  </p>
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                    id={`completion-photos-${complaint._id}`}
                                    max="5"
                                    ref={(input) => {
                                      if (input) {
                                        // Store input reference for direct access
                                        input.complaintId = complaint._id;
                                      }
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const input = document.getElementById(
                                        `completion-photos-${complaint._id}`
                                      );
                                      if (input) input.click();
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Upload className="h-3 w-3 mr-1" />
                                    Select Photos ({completionPhotos.length}/5)
                                  </Button>
                                </div>

                                {completionPhotos.length > 0 && (
                                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-3">
                                    {completionPhotos.map((file, index) => {
                                      const imageUrl =
                                        URL.createObjectURL(file);
                                      return (
                                        <div key={index} className="relative">
                                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                            <img
                                              src={imageUrl}
                                              alt={`Completion photo ${
                                                index + 1
                                              }`}
                                              className="w-full h-full object-cover"
                                              onLoad={() =>
                                                URL.revokeObjectURL(imageUrl)
                                              }
                                            />
                                          </div>
                                          <p className="text-xs text-gray-600 mt-1 truncate">
                                            {file.name}
                                          </p>
                                          <button
                                            onClick={() => removePhoto(index)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center space-x-2 pt-2">
                                <Button
                                  variant="primary"
                                  onClick={() => markAsCompleted(complaint._id)}
                                  className="flex-1 py-2"
                                  size="sm"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Completed
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setSelectedComplaint(null)}
                                  size="sm"
                                  className="px-4"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default WorkerPage;
