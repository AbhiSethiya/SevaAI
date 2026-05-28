import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  UserCheck,
  UserPlus,
  Award,
  Settings,
  Bell,
  Filter,
  LogOut,
  User,
  Search,
  ChevronDown,
} from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import ComplaintsPage from "./ComplaintsPage";
import WorkersPage from "./WorkersPage";
import { complaintAPI, dashboardAPI, workerAPI, DEPARTMENTS } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import {
  DepartmentChart,
  StatusChart,
  PriorityChart,
  TrendChart,
} from "../components/common/Charts";
import { getPriorityColor, getComplaintStatusColor } from "../utils/colorUtils";

const Dashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30days");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    totalComplaints: 0,
    resolvedCases: 0,
    pendingCases: 0,
    activeWorkers: 0,
    byStatus: {},
    byDepartment: {},
    byPriority: {},
    percentageChanges: {
      totalComplaints: 0,
      resolvedCases: 0,
      pendingCases: 0,
      activeWorkers: 0,
    },
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [trendData, setTrendData] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [showAssignWorkerModal, setShowAssignWorkerModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [showWorkerPerformanceModal, setShowWorkerPerformanceModal] =
    useState(false);
  const [selectedWorkerForPerformance, setSelectedWorkerForPerformance] =
    useState(null);
  const { user, logout } = useAuth();

  // Fetch dashboard data on component mount and when timeframe/department changes
  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeframe, departmentFilter]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard statistics from dedicated dashboard API
      const [statsResponse, recentComplaintsResponse] = await Promise.all([
        dashboardAPI.getStats(selectedTimeframe, departmentFilter),
        dashboardAPI.getRecentComplaints(3, departmentFilter),
      ]);

      const dashboardStats = statsResponse.data || {};
      const recentComplaintsData = recentComplaintsResponse.data || [];

      console.log("Dashboard stats received:", dashboardStats);
      console.log("Percentage changes:", dashboardStats.percentageChanges);

      // Set dashboard stats with calculated percentages if not provided by backend
      const percentageChanges = dashboardStats.percentageChanges || {};

      // Ensure all percentage change properties exist
      const safePercentageChanges = {
        totalComplaints: percentageChanges.totalComplaints || 0,
        resolvedComplaints: percentageChanges.resolvedComplaints || 0,
        pendingComplaints: percentageChanges.pendingComplaints || 0,
        activeWorkers: percentageChanges.activeWorkers || 0,
      };

      // Generate mock percentage changes if backend doesn't provide them
      if (
        !dashboardStats.percentageChanges ||
        Object.keys(dashboardStats.percentageChanges).length === 0
      ) {
        const timeframeMultiplier =
          {
            "7days": 0.5,
            "30days": 1,
            "90days": 2,
            "6months": 3,
            "1year": 5,
          }[selectedTimeframe] || 1;

        percentageChanges.totalComplaints =
          (Math.random() * 20 - 10) * timeframeMultiplier; // -10% to +10%
        percentageChanges.resolvedComplaints =
          (Math.random() * 15 + 5) * timeframeMultiplier; // +5% to +20%
        percentageChanges.pendingComplaints =
          (Math.random() * 30 - 15) * timeframeMultiplier; // -15% to +15%
        percentageChanges.activeWorkers =
          (Math.random() * 10 - 5) * timeframeMultiplier; // -5% to +5%

        // Update the safe object
        safePercentageChanges.totalComplaints =
          percentageChanges.totalComplaints;
        safePercentageChanges.resolvedComplaints =
          percentageChanges.resolvedComplaints;
        safePercentageChanges.pendingComplaints =
          percentageChanges.pendingComplaints;
        safePercentageChanges.activeWorkers = percentageChanges.activeWorkers;
      }

      setStats({
        totalComplaints: dashboardStats.totalComplaints || 0,
        resolvedCases: dashboardStats.resolvedComplaints || 0,
        pendingCases: dashboardStats.pendingComplaints || 0,
        activeWorkers: dashboardStats.activeWorkers || 0,
        byStatus: dashboardStats.byStatus || {},
        byDepartment: dashboardStats.byDepartment || {},
        byPriority: dashboardStats.byPriority || {},
        percentageChanges: {
          totalComplaints: safePercentageChanges.totalComplaints,
          resolvedCases: safePercentageChanges.resolvedComplaints,
          pendingCases: safePercentageChanges.pendingComplaints,
          activeWorkers: safePercentageChanges.activeWorkers,
        },
      });

      // Set recent complaints
      const formattedComplaints = recentComplaintsData.map((complaint) => ({
        id: complaint._id || complaint.id,
        ticketId: complaint.ticketId,
        title: complaint.locationName || complaint.location || "Complaint",
        category: complaint.department,
        priority: complaint.priority || "Medium",
        status: complaint.status,
        assignedTo: complaint.assignedTo || "Unassigned",
        submittedAt: complaint.createdAt,
        location:
          complaint.locationName || complaint.location || "Unknown location",
      }));

      setRecentComplaints(formattedComplaints);

      // Fetch trend data from backend (you can implement this API later)
      // For now, generate basic trend data based on actual stats
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          complaints:
            Math.floor((dashboardStats.totalComplaints || 0) / 7) +
            Math.floor(Math.random() * 5),
          resolved:
            Math.floor((dashboardStats.resolvedComplaints || 0) / 7) +
            Math.floor(Math.random() * 3),
        };
      });
      setTrendData(last7Days);

      // Fetch workers data from backend
      try {
        const workersResponse = await dashboardAPI.getWorkerStats();
        setWorkers(workersResponse.data || []);
      } catch (workerError) {
        console.error("Error fetching workers:", workerError);
        // Keep workers empty if fetch fails
        setWorkers([]);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch dashboard data");
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleDepartmentFilterChange = (department) => {
    setDepartmentFilter(department);
  };

  // Handle viewing complaint details
  const handleViewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowComplaintModal(true);
  };

  // Export report functionality
  const handleExportReport = async () => {
    try {
      const reportData = {
        timeframe: selectedTimeframe,
        department: departmentFilter,
        generatedAt: new Date().toISOString(),
        stats: stats,
        recentComplaints: recentComplaints,
        workers: workers,
        trendData: trendData,
      };

      // Convert to CSV format
      const csvContent = generateCSVReport(reportData);

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const timeframeLabel =
        {
          "7days": "7-days",
          "30days": "30-days",
          "90days": "90-days",
          "6months": "6-months",
          "1year": "1-year",
        }[selectedTimeframe] || selectedTimeframe;

      const departmentLabel =
        departmentFilter === "all" ? "all-departments" : departmentFilter;

      link.download = `municipal-dashboard-report-${timeframeLabel}-${departmentLabel}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting report:", error);
      alert("Failed to export report. Please try again.");
    }
  };

  // Generate CSV content from report data
  const generateCSVReport = (data) => {
    let csv = "";

    // Header
    csv += `Municipal Dashboard Report\n`;
    csv += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`;
    csv += `Timeframe: ${data.timeframe}\n`;
    csv += `Department: ${data.department}\n\n`;

    // Summary Stats
    csv += `Summary Statistics\n`;
    csv += `Metric,Value,Change\n`;
    csv += `Total Complaints,${
      data.stats.totalComplaints
    },${formatPercentageChange(
      data.stats.percentageChanges.totalComplaints
    )}\n`;
    csv += `Resolved Cases,${data.stats.resolvedCases},${formatPercentageChange(
      data.stats.percentageChanges.resolvedCases
    )}\n`;
    csv += `Pending Cases,${data.stats.pendingCases},${formatPercentageChange(
      data.stats.percentageChanges.pendingCases
    )}\n`;
    csv += `Active Workers,${data.stats.activeWorkers},${formatPercentageChange(
      data.stats.percentageChanges.activeWorkers
    )}\n\n`;

    // Recent Complaints
    csv += `Recent Complaints\n`;
    csv += `Ticket ID,Title,Category,Priority,Status,Assigned To,Date\n`;
    data.recentComplaints.forEach((complaint) => {
      csv += `${complaint.ticketId},"${complaint.title}",${
        complaint.category
      },${complaint.priority},${complaint.status},${
        complaint.assignedTo
      },${new Date(complaint.submittedAt).toLocaleDateString()}\n`;
    });

    csv += `\n`;

    // Workers Summary
    csv += `Workers Summary\n`;
    csv += `Name,Department,Active Cases,Completed Today,Rating,Status\n`;
    data.workers.slice(0, 10).forEach((worker) => {
      csv += `${worker.name},${worker.department},${worker.activeCases || 0},${
        worker.completedToday || 0
      },${worker.rating ? worker.rating.toFixed(1) : "N/A"},${
        worker.status || "active"
      }\n`;
    });

    return csv;
  };

  // Helper function to format percentage changes
  const formatPercentageChange = (change) => {
    if (change === 0) return { text: "0%", color: "text-gray-500" };

    const isPositive = change > 0;
    const text = isPositive
      ? `+${change.toFixed(1)}%`
      : `${change.toFixed(1)}%`;
    const color = isPositive ? "text-green-600" : "text-red-600";

    return { text, color };
  };

  // Render different content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "complaints":
        return <ComplaintsPage />;
      case "workers":
        return <WorkersPage />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => {
    const statsCards = [
      {
        title: "Total Complaints",
        value: stats.totalComplaints.toLocaleString(),
        change: formatPercentageChange(stats.percentageChanges.totalComplaints),
        trend: stats.percentageChanges.totalComplaints >= 0 ? "up" : "down",
        icon: FileText,
        color: "text-primary",
        bgColor: "bg-blue-50",
      },
      {
        title: "Resolved Cases",
        value: stats.resolvedCases.toLocaleString(),
        change: formatPercentageChange(stats.percentageChanges.resolvedCases),
        trend: stats.percentageChanges.resolvedCases >= 0 ? "up" : "down",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Pending Cases",
        value: stats.pendingCases.toLocaleString(),
        change: formatPercentageChange(stats.percentageChanges.pendingCases),
        trend: stats.percentageChanges.pendingCases >= 0 ? "up" : "down",
        icon: Clock,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
      {
        title: "Active Workers",
        value: stats.activeWorkers.toLocaleString(),
        change: formatPercentageChange(stats.percentageChanges.activeWorkers),
        trend: stats.percentageChanges.activeWorkers >= 0 ? "up" : "down",
        icon: UserCheck,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
    ];

    if (loading) {
      return (
        <motion.div
          className="flex items-center justify-center h-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="rounded-full h-12 w-12 border-b-2 border-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      );
    }

    if (error) {
      return (
        <Card>
          <div className="text-center text-red-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">Error Loading Dashboard</p>
            <p className="text-sm text-text-light">{error}</p>
            <Button
              variant="outline"
              onClick={fetchDashboardData}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </Card>
      );
    }

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Dashboard Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          variants={itemVariants}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-text">Dashboard Overview</h1>
            <p className="text-text-light">
              Monitor and manage municipal complaints
            </p>
          </motion.div>
          <motion.div
            className="flex items-center space-x-4"
            variants={itemVariants}
          >
            <Select
              value={departmentFilter}
              onChange={(e) => handleDepartmentFilterChange(e.target.value)}
              options={DEPARTMENTS}
            />
            <Select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              options={[
                { value: "7days", label: "Last 7 days" },
                { value: "30days", label: "Last 30 days" },
                { value: "90days", label: "Last 90 days" },
                { value: "6months", label: "Last 6 months" },
                { value: "1year", label: "Last year" },
              ]}
            />
            <Button
              variant="primary"
              onClick={handleExportReport}
              className="whitespace-nowrap"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
              },
            },
          }}
        >
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="h-full"
              >
                <Card className="h-full">
                  <div className="flex items-center h-full">
                    <motion.div
                      className={`p-3 rounded-lg ${stat.bgColor} mr-4 flex-shrink-0`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-light text-sm mb-1">
                        {stat.title}
                      </p>
                      <div className="flex items-center flex-wrap gap-2">
                        <motion.p
                          className="text-2xl font-bold text-text"
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: 0.4 + index * 0.1,
                            type: "spring",
                            stiffness: 200,
                          }}
                        >
                          {stat.value}
                        </motion.p>
                        <motion.span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            stat.trend === "up"
                              ? "bg-green-100 text-green-800"
                              : stat.trend === "down"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          {typeof stat.change === "object"
                            ? stat.change.text
                            : stat.change}
                        </motion.span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Performance Charts - All in one row */}
        <motion.div
          className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-6 mb-8"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
              },
            },
          }}
        >
          {/* Department Statistics */}
          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full"
          >
            <DepartmentChart departmentStats={stats.byDepartment} />
          </motion.div>

          {/* Priority Distribution */}
          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full"
          >
            <PriorityChart priorityStats={stats.byPriority} />
          </motion.div>

          {/* Complaints Trend */}
          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full lg:col-span-2 xl:col-span-1"
          >
            <TrendChart trendData={trendData} />
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Complaints */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text">
                Recent Complaints
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("complaints")}
              >
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {recentComplaints.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent complaints</p>
                </div>
              ) : (
                recentComplaints
                  .sort((a, b) => {
                    // Sort by submitted date (most recent first)
                    const dateA = new Date(a.submittedAt || a.createdAt || 0);
                    const dateB = new Date(b.submittedAt || b.createdAt || 0);
                    return dateB - dateA;
                  })
                  .slice(0, 3)
                  .map((complaint) => (
                    <div
                      key={complaint.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-text">
                          {complaint.title}
                        </h4>
                        <div className="flex space-x-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColorLocal(
                              complaint.priority
                            )}`}
                          >
                            {complaint.priority.toUpperCase()}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              complaint.status
                            )}`}
                          >
                            {complaint.status.replace("-", " ").toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-text-light space-y-1">
                        <p>
                          ID: {complaint.ticketId} | Category:{" "}
                          {complaint.category}
                        </p>
                        <p>Location: {complaint.location}</p>
                        <p>Assigned to: {complaint.assignedTo}</p>
                        <p>
                          Submitted:{" "}
                          {new Date(complaint.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewComplaintDetails(complaint)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </Card>

          {/* Worker Management */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text">Top Workers</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("workers")}
              >
                Manage Workers
              </Button>
            </div>

            <div className="space-y-4">
              {workers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No workers available</p>
                </div>
              ) : (
                workers
                  .sort((a, b) => {
                    // Sort by rating first (descending), then by completed cases (descending)
                    const ratingA = a.rating || 0;
                    const ratingB = b.rating || 0;
                    if (ratingB !== ratingA) {
                      return ratingB - ratingA;
                    }
                    const completedA =
                      a.completedToday || a.completedCases || 0;
                    const completedB =
                      b.completedToday || b.completedCases || 0;
                    return completedB - completedA;
                  })
                  .slice(0, 3)
                  .map((worker) => (
                    <div
                      key={worker.id || worker._id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-text">
                            {worker.name}
                          </h4>
                          <p className="text-sm text-text-light">
                            {worker.department === "road"
                              ? "Roads & Transportation"
                              : worker.department === "water"
                              ? "Water Supply"
                              : worker.department === "electricity"
                              ? "Electricity"
                              : worker.department === "waste"
                              ? "Waste Management"
                              : worker.department === "drainage"
                              ? "Drainage & Sewerage"
                              : worker.department || "General"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <Award className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm font-medium">
                              {worker.rating ? worker.rating.toFixed(1) : "4.5"}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              worker.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {(worker.status || "active").toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-text-light">
                        <div>
                          Active Cases:{" "}
                          <span className="font-medium text-text">
                            {worker.activeCases}
                          </span>
                        </div>
                        <div>
                          Completed Today:{" "}
                          <span className="font-medium text-text">
                            {worker.completedToday}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => handleViewWorkerPerformance(worker)}
                        >
                          View Performance
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </Card>
        </div>
      </motion.div>
    );
  };

  const getStatusColor = (status) => {
    return getComplaintStatusColor(status, "light");
  };

  const getPriorityColorLocal = (priority) => {
    return getPriorityColor(priority, "light");
  };

  // Handle worker assignment
  const handleAssignWorker = async (complaint) => {
    try {
      // Get available workers for the complaint's department
      const response = await workerAPI.getAvailableWorkers(
        complaint.category || complaint.department
      );
      setAvailableWorkers(response.data || []);
      setSelectedComplaint(complaint);
      setShowAssignWorkerModal(true);
      setSelectedWorker("");
      setEstimatedTime("");
    } catch (error) {
      console.error("Error fetching available workers:", error);
      alert("Failed to fetch available workers. Please try again.");
    }
  };

  const confirmAssignWorker = async () => {
    if (!selectedWorker || !estimatedTime) {
      alert("Please select a worker and provide estimated completion time.");
      return;
    }

    try {
      setAssignmentLoading(true);
      await workerAPI.assignComplaint(
        selectedComplaint.id,
        selectedWorker,
        parseInt(estimatedTime)
      );

      alert("Complaint assigned successfully!");
      setShowAssignWorkerModal(false);
      setShowComplaintModal(false);

      // Refresh data
      fetchDashboardData();
    } catch (error) {
      console.error("Error assigning complaint:", error);
      alert("Failed to assign complaint. Please try again.");
    } finally {
      setAssignmentLoading(false);
    }
  };

  const assignComplaint = (complaintId, workerId) => {
    console.log(`Assigning complaint ${complaintId} to worker ${workerId}`);
    // This is deprecated - use handleAssignWorker instead
  };

  // Handle viewing worker performance
  const handleViewWorkerPerformance = (worker) => {
    setSelectedWorkerForPerformance(worker);
    setShowWorkerPerformanceModal(true);
  };

  // Custom Header Component
  const CustomHeader = () => (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and current page */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text">
                Municipal Dashboard
              </h1>
              <p className="text-sm text-text-light">
                {activeTab === "dashboard" && "Overview & Analytics"}
                {activeTab === "complaints" && "Complaints Management"}
                {activeTab === "workers" && "Workers Management"}
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-4">
          {/* Quick search */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Quick search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="relative dropdown-container">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-text">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-3 hover:bg-gray-50 border-b border-gray-100">
                    <p className="text-sm font-medium text-text">
                      New complaint assigned
                    </p>
                    <p className="text-xs text-text-light">
                      Pothole repair on Main Street - 5 min ago
                    </p>
                  </div>
                  <div className="p-3 hover:bg-gray-50 border-b border-gray-100">
                    <p className="text-sm font-medium text-text">
                      Worker completed task
                    </p>
                    <p className="text-xs text-text-light">
                      Street light repair - 1 hour ago
                    </p>
                  </div>
                  <div className="p-3 hover:bg-gray-50">
                    <p className="text-sm font-medium text-text">
                      System maintenance
                    </p>
                    <p className="text-xs text-text-light">
                      Scheduled for tonight - 2 hours ago
                    </p>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button className="text-sm text-primary hover:text-primary-dark">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative dropdown-container">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-text">
                  {user?.username || "Admin User"}
                </p>
                <p className="text-xs text-text-light">
                  {user?.role === "admin" ? "System Administrator" : "User"}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                  <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                    <User className="h-4 w-4 mr-3" />
                    Profile Settings
                  </button>
                  <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                    <Settings className="h-4 w-4 mr-3" />
                    Preferences
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  // Animation variants for subtle animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-background-light"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Custom Header */}
      <CustomHeader />

      {/* Main Dashboard Layout */}
      <div className="flex">
        {/* Sidebar */}
        <div
          className="w-64 bg-white shadow-lg"
          style={{ minHeight: "calc(100vh - 73px)" }}
        >
          <motion.nav className="mt-6 px-4" variants={itemVariants}>
            <div className="space-y-2">
              <motion.button
                onClick={() => handleTabChange("dashboard")}
                className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                  activeTab === "dashboard"
                    ? "text-primary bg-primary-50"
                    : "text-text-light hover:text-text hover:bg-gray-50"
                }`}
                whileHover={{ scale: 1.02, x: 3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <BarChart3 className="h-5 w-5 mr-3" />
                </motion.div>
                Dashboard
              </motion.button>
              <motion.button
                onClick={() => handleTabChange("complaints")}
                className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                  activeTab === "complaints"
                    ? "text-primary bg-primary-50"
                    : "text-text-light hover:text-text hover:bg-gray-50"
                }`}
              >
                <motion.div
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <FileText className="h-5 w-5 mr-3" />
                </motion.div>
                Complaints
              </motion.button>
              <motion.button
                onClick={() => handleTabChange("workers")}
                className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                  activeTab === "workers"
                    ? "text-primary bg-primary-50"
                    : "text-text-light hover:text-text hover:bg-gray-50"
                }`}
                whileHover={{ scale: 1.02, x: 3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Users className="h-5 w-5 mr-3" />
                </motion.div>
                Workers
              </motion.button>
            </div>
          </motion.nav>
        </div>

        {/* Main Content */}
        <motion.div
          className="flex-1 p-6 bg-gray-50"
          style={{ minHeight: "calc(100vh - 73px)" }}
          variants={itemVariants}
        >
          {renderContent()}
        </motion.div>
      </div>

      {/* Complaint Details Modal */}
      {showComplaintModal && selectedComplaint && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-text">
                  Complaint Details
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComplaintModal(false)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ticket ID
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedComplaint.ticketId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedComplaint.category}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedComplaint.title}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedComplaint.location}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColorLocal(
                        selectedComplaint.priority
                      )}`}
                    >
                      {selectedComplaint.priority?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        selectedComplaint.status
                      )}`}
                    >
                      {selectedComplaint.status
                        ?.replace("-", " ")
                        .toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedComplaint.assignedTo || "Unassigned"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Submitted Date
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {new Date(selectedComplaint.submittedAt).toLocaleString()}
                  </p>
                </div>

                {selectedComplaint.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                      {selectedComplaint.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowComplaintModal(false)}
                >
                  Close
                </Button>
                {(selectedComplaint?.status === "pending" ||
                  selectedComplaint?.status === "submitted") && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowComplaintModal(false);
                      handleAssignWorker(selectedComplaint);
                    }}
                  >
                    Assign Worker
                  </Button>
                )}
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowComplaintModal(false);
                    setActiveTab("complaints");
                  }}
                >
                  Go to Complaints Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Worker Modal */}
      {showAssignWorkerModal && selectedComplaint && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          {" "}
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-text">
                  Assign Worker
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAssignWorkerModal(false)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complaint
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedComplaint.title} ({selectedComplaint.ticketId})
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedComplaint.category || selectedComplaint.department}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Workers
                  </label>
                  <Select
                    value={selectedWorker}
                    onChange={(e) => setSelectedWorker(e.target.value)}
                    options={[
                      { value: "", label: "Select a worker..." },
                      ...availableWorkers.map((worker) => ({
                        value: worker._id,
                        label: `${worker.fullName || worker.username} (${
                          worker.activeComplaintCount || 0
                        } active)`,
                      })),
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Completion Time (hours)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="72"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="Enter hours..."
                  />
                </div>

                {availableWorkers.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500">
                      No available workers in this department
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignWorkerModal(false)}
                  disabled={assignmentLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={confirmAssignWorker}
                  disabled={
                    assignmentLoading ||
                    !selectedWorker ||
                    !estimatedTime ||
                    availableWorkers.length === 0
                  }
                >
                  {assignmentLoading ? "Assigning..." : "Assign Worker"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Worker Performance Modal */}
      {showWorkerPerformanceModal && selectedWorkerForPerformance && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-text">
                  Worker Performance Details
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWorkerPerformanceModal(false)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                {/* Worker Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedWorkerForPerformance.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedWorkerForPerformance.department === "road"
                        ? "Roads & Transportation"
                        : selectedWorkerForPerformance.department === "water"
                        ? "Water Supply"
                        : selectedWorkerForPerformance.department ===
                          "electricity"
                        ? "Electricity"
                        : selectedWorkerForPerformance.department === "waste"
                        ? "Waste Management"
                        : selectedWorkerForPerformance.department === "drainage"
                        ? "Drainage & Sewerage"
                        : selectedWorkerForPerformance.department || "General"}
                    </p>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h4 className="text-lg font-medium text-text mb-4">
                    Performance Metrics
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">
                            Active Cases
                          </p>
                          <p className="text-2xl font-bold text-blue-800">
                            {selectedWorkerForPerformance.activeCases || 0}
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-medium">
                            Completed Today
                          </p>
                          <p className="text-2xl font-bold text-green-800">
                            {selectedWorkerForPerformance.completedToday || 0}
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-yellow-600 font-medium">
                            Rating
                          </p>
                          <p className="text-2xl font-bold text-yellow-800">
                            {selectedWorkerForPerformance.rating
                              ? selectedWorkerForPerformance.rating.toFixed(1)
                              : "4.5"}
                          </p>
                        </div>
                        <Award className="h-8 w-8 text-yellow-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Availability */}
                <div>
                  <h4 className="text-lg font-medium text-text mb-4">
                    Status & Availability
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Status
                      </label>
                      <span
                        className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                          selectedWorkerForPerformance.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {(
                          selectedWorkerForPerformance.status || "active"
                        ).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Work Load
                      </label>
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              selectedWorkerForPerformance.activeCases <= 2
                                ? "bg-green-500"
                                : selectedWorkerForPerformance.activeCases <= 4
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (selectedWorkerForPerformance.activeCases / 5) *
                                  100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {selectedWorkerForPerformance.activeCases}/5
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className="text-lg font-medium text-text mb-4">
                    Recent Activity
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Total Completed Cases:
                        </span>
                        <span className="font-medium text-gray-900">24</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Average Resolution Time:
                        </span>
                        <span className="font-medium text-gray-900">
                          2.3 hours
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="font-medium text-gray-900">96%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Customer Satisfaction:
                        </span>
                        <span className="font-medium text-gray-900">
                          {selectedWorkerForPerformance.rating
                            ? selectedWorkerForPerformance.rating.toFixed(1)
                            : "4.5"}
                          /5.0
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowWorkerPerformanceModal(false)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowWorkerPerformanceModal(false);
                    setActiveTab("workers");
                  }}
                >
                  Go to Workers Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
