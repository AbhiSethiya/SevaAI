import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Eye,
  Edit,
  Award,
  Clock,
  UserCheck,
  UserX,
  Download,
  Plus,
  BarChart3,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import {
  userAPI,
  hodAPI,
  dashboardAPI,
  workerAPI,
  DEPARTMENTS,
} from "../lib/api";
import { BarChart, DoughnutChart } from "../components/common/Charts";
import { getWorkerStatusColor } from "../utils/colorUtils";

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

const headingVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const statsVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
    },
  },
};

const WorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    department: "all",
    status: "all",
    performance: "all",
  });
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [showEditWorkerModal, setShowEditWorkerModal] = useState(false);
  const [showChartsView, setShowChartsView] = useState(false);
  const [newWorkerData, setNewWorkerData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    department: "road",
    password: "",
  });
  const [editWorkerData, setEditWorkerData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "road",
    specializations: [],
  });
  const [addWorkerLoading, setAddWorkerLoading] = useState(false);
  const [editWorkerLoading, setEditWorkerLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [workersPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onBreak: 0,
    averageRating: 0,
  });

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [filters]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get workers data from backend with statistics
      const response = await workerAPI.getAllWorkers(filters);
      const workersData = response.data || [];

      setWorkers(workersData);

      // Calculate stats
      const totalWorkers = workersData.length;
      const activeWorkers = workersData.filter(
        (w) => w.workStatus === "available"
      ).length;
      const onBreakWorkers = workersData.filter(
        (w) => w.workStatus === "on-break"
      ).length;
      const avgRating =
        totalWorkers > 0
          ? workersData.reduce((sum, w) => sum + (w.rating || 4.5), 0) /
            totalWorkers
          : 0;

      setStats({
        total: totalWorkers,
        active: activeWorkers,
        onBreak: onBreakWorkers,
        averageRating: avgRating.toFixed(1),
      });
    } catch (err) {
      setError(err.message || "Failed to fetch workers");
      console.error("Error fetching workers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Add worker functionality
  const handleAddWorker = async () => {
    try {
      setAddWorkerLoading(true);

      // Validate required fields
      if (
        !newWorkerData.username ||
        !newWorkerData.fullName ||
        !newWorkerData.password
      ) {
        alert("Please fill in all required fields");
        return;
      }

      const workerPayload = {
        username: newWorkerData.username,
        fullName: newWorkerData.fullName,
        email: newWorkerData.email,
        phone: newWorkerData.phone,
        department: newWorkerData.department,
        password: newWorkerData.password,
        specializations: [],
      };

      const response = await workerAPI.createWorker(workerPayload);

      if (response.success) {
        alert("Worker added successfully!");
        setShowAddWorkerModal(false);
        setNewWorkerData({
          username: "",
          fullName: "",
          email: "",
          phone: "",
          department: "road",
          password: "",
        });
        // Refresh worker data
        fetchWorkers();
      } else {
        alert(response.message || "Failed to add worker");
      }
    } catch (error) {
      console.error("Error adding worker:", error);
      alert(error.message || "Failed to add worker. Please try again.");
    } finally {
      setAddWorkerLoading(false);
    }
  };

  const handleEditWorker = async () => {
    try {
      setEditWorkerLoading(true);

      // Basic validation
      if (!editWorkerData.fullName || !editWorkerData.email) {
        alert("Please fill in all required fields");
        return;
      }

      const response = await workerAPI.updateWorker(
        selectedWorker._id,
        editWorkerData
      );

      if (response.success) {
        alert("Worker updated successfully!");
        setShowEditWorkerModal(false);
        setShowDetailModal(false);
        setEditWorkerData({
          fullName: "",
          email: "",
          phone: "",
          department: "road",
          specializations: [],
        });
        // Refresh worker data
        fetchWorkers();
      } else {
        alert(response.message || "Failed to update worker");
      }
    } catch (error) {
      console.error("Error updating worker:", error);
      alert(error.message || "Failed to update worker. Please try again.");
    } finally {
      setEditWorkerLoading(false);
    }
  };

  const openEditModal = (worker) => {
    setEditWorkerData({
      fullName: worker.fullName || "",
      email: worker.email || "",
      phone: worker.phone || "",
      department: worker.department || "road",
      specializations: worker.specializations || [],
    });
    setShowEditWorkerModal(true);
  };

  const handleWorkerInputChange = (field, value) => {
    setNewWorkerData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filteredWorkers = workers.filter((worker) => {
    // Search filter
    if (
      searchTerm &&
      !worker.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !worker.email?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !worker.department?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Department filter
    if (
      filters.department !== "all" &&
      worker.department !== filters.department
    ) {
      return false;
    }

    // Status filter
    if (
      filters.status !== "all" &&
      (worker.workStatus || worker.status) !== filters.status
    ) {
      return false;
    }

    // Performance filter
    if (filters.performance !== "all") {
      if (filters.performance === "high" && worker.performanceScore < 90)
        return false;
      if (
        filters.performance === "medium" &&
        (worker.performanceScore < 70 || worker.performanceScore >= 90)
      )
        return false;
      if (filters.performance === "low" && worker.performanceScore >= 70)
        return false;
    }

    return true;
  });

  // Sorting function
  // Helper function to get nested values
  const getNestedValue = (obj, key) => {
    switch (key) {
      case "name":
        return obj.fullName || obj.name || "";
      case "department":
        return obj.department || "";
      case "status":
        return obj.workStatus || obj.status || "";
      case "activeCases":
        return obj.activeCases || 0;
      case "completedCases":
        return obj.completedCases || 0;
      case "rating":
        return obj.rating || 0;
      case "performance":
        return obj.performanceScore || 0;
      default:
        return obj[key] || "";
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Apply sorting to filtered workers
  const sortedWorkers = [...filteredWorkers].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = getNestedValue(a, sortConfig.key);
    const bValue = getNestedValue(b, sortConfig.key);

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (sortConfig.direction === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination logic - use sortedWorkers instead of filteredWorkers
  const totalPages = Math.ceil(sortedWorkers.length / workersPerPage);
  const startIndex = (currentPage - 1) * workersPerPage;
  const endIndex = startIndex + workersPerPage;
  const currentWorkers = sortedWorkers.slice(startIndex, endIndex);

  // Function to render sort icon
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    }
    if (sortConfig.direction === "asc") {
      return <ChevronUp className="h-4 w-4 text-primary" />;
    } else {
      return <ChevronDown className="h-4 w-4 text-primary" />;
    }
  };

  // Reset to first page when search changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const getStatusColor = (status) => {
    return getWorkerStatusColor(status, "light");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "available":
      case "active":
        return <UserCheck className="h-4 w-4" />;
      case "busy":
        return <Clock className="h-4 w-4" />;
      case "on-break":
      case "break":
        return <Clock className="h-4 w-4" />;
      case "offline":
        return <UserX className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const viewWorkerDetails = (worker) => {
    setSelectedWorker(worker);
    setShowDetailModal(true);
  };

  const exportWorkers = () => {
    const headers = [
      "Name",
      "Email",
      "Department",
      "Status",
      "Active Cases",
      "Completed Cases",
      "Rating",
      "Performance Score",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredWorkers.map((worker) =>
        [
          worker.name,
          worker.email,
          worker.department,
          worker.workStatus || worker.status || "available",
          worker.activeCases || worker.metrics?.activeComplaints || 0,
          worker.completedCases || worker.metrics?.completedCount || 0,
          worker.rating?.toFixed(1) || "4.5",
          worker.performanceScore,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workers_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-text">Workers Management</h1>
          <p className="text-text-light">
            Manage municipal workers and their performance
          </p>
        </motion.div>
        <motion.div
          className="flex items-center space-x-4"
          variants={itemVariants}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={showChartsView ? "primary" : "outline"}
              onClick={() => setShowChartsView(!showChartsView)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {showChartsView ? "Hide Charts" : "Show Charts"}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" onClick={exportWorkers}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="primary"
              onClick={() => setShowAddWorkerModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Worker
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        <motion.div
          variants={statsVariants}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
        >
          <Card>
            <div className="flex items-center">
              <motion.div
                className="p-3 rounded-lg bg-blue-50 mr-4"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Users className="h-6 w-6 text-blue-600" />
              </motion.div>
              <div>
                <p className="text-text-light text-sm">Total Workers</p>
                <p className="text-2xl font-bold text-text">{stats.total}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          variants={statsVariants}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
        >
          <Card>
            <div className="flex items-center">
              <motion.div
                className="p-3 rounded-lg bg-green-50 mr-4"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  delay: 0.2,
                }}
              >
                <UserCheck className="h-6 w-6 text-green-600" />
              </motion.div>
              <div>
                <p className="text-text-light text-sm">Active Now</p>
                <p className="text-2xl font-bold text-text">{stats.active}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          variants={statsVariants}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
        >
          <Card>
            <div className="flex items-center">
              <motion.div
                className="p-3 rounded-lg bg-yellow-50 mr-4"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  delay: 0.4,
                }}
              >
                <Clock className="h-6 w-6 text-yellow-600" />
              </motion.div>
              <div>
                <p className="text-text-light text-sm">On Break</p>
                <p className="text-2xl font-bold text-text">{stats.onBreak}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          variants={statsVariants}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
        >
          <Card>
            <div className="flex items-center">
              <motion.div
                className="p-3 rounded-lg bg-purple-50 mr-4"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  delay: 0.6,
                }}
              >
                <Award className="h-6 w-6 text-purple-600" />
              </motion.div>
              <div>
                <p className="text-text-light text-sm">Avg Rating</p>
                <p className="text-2xl font-bold text-text">
                  {stats.averageRating}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
            {/* Search - takes 2 columns on large screens */}
            <motion.div
              className="lg:col-span-1"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <label className="block text-sm font-medium text-text mb-2">
                Search
              </label>
              <Input
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={handleSearchChange}
                icon={Search}
              />
            </motion.div>

            {/* Department Filter */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <label className="block text-sm font-medium text-text mb-2">
                Department
              </label>
              <Select
                value={filters.department}
                onChange={(e) =>
                  handleFilterChange("department", e.target.value)
                }
                options={DEPARTMENTS}
              />
            </motion.div>

            {/* Status Filter */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <label className="block text-sm font-medium text-text mb-2">
                Status
              </label>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "break", label: "On Break" },
                  { value: "offline", label: "Offline" },
                ]}
              />
            </motion.div>

            {/* Performance Filter */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <label className="block text-sm font-medium text-text mb-2">
                Performance
              </label>
              <Select
                value={filters.performance}
                onChange={(e) =>
                  handleFilterChange("performance", e.target.value)
                }
                options={[
                  { value: "all", label: "All Performance" },
                  { value: "high", label: "High (90+)" },
                  { value: "medium", label: "Medium (70-89)" },
                  { value: "low", label: "Low (<70)" },
                ]}
              />
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Charts Section - Only show when toggled */}
      <AnimatePresence>
        {showChartsView && (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <DoughnutChart
                data={{
                  labels: [
                    "Roads",
                    "Water",
                    "Electricity",
                    "Waste",
                    "Drainage",
                  ],
                  series: [8, 6, 5, 4, 3],
                }}
                title="Workers by Department"
                height={250}
              />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <DoughnutChart
                data={{
                  labels: ["Active", "On Break", "Offline"],
                  series: [
                    stats.active,
                    stats.onBreak,
                    stats.total - stats.active - stats.onBreak,
                  ],
                }}
                title="Worker Status"
                height={250}
              />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <DoughnutChart
                data={{
                  labels: [
                    "Excellent (4.5+)",
                    "Good (3.5-4.4)",
                    "Average (< 3.5)",
                  ],
                  series: [
                    filteredWorkers.filter((w) => (w.rating || 4.5) >= 4.5)
                      .length,
                    filteredWorkers.filter(
                      (w) => (w.rating || 4.5) >= 3.5 && (w.rating || 4.5) < 4.5
                    ).length,
                    filteredWorkers.filter((w) => (w.rating || 4.5) < 3.5)
                      .length,
                  ],
                }}
                title="Worker Ratings"
                height={250}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workers List */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-text">
              Workers ({sortedWorkers.length})
            </h3>
            {totalPages > 1 && (
              <div className="text-sm text-text-light">
                Showing {startIndex + 1}-
                {Math.min(endIndex, sortedWorkers.length)} of{" "}
                {sortedWorkers.length}
              </div>
            )}
          </div>

          {sortedWorkers.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              </motion.div>
              <h4 className="text-lg font-medium text-gray-600 mb-2">
                No Workers Found
              </h4>
              <p className="text-gray-500">
                No workers match your current filters.
              </p>
            </motion.div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-text">
                        <button
                          onClick={() => handleSort("name")}
                          className="flex items-center space-x-1 hover:text-primary transition-colors"
                        >
                          <span>Worker</span>
                          {getSortIcon("name")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-text">
                        <button
                          onClick={() => handleSort("department")}
                          className="flex items-center space-x-1 hover:text-primary transition-colors"
                        >
                          <span>Department</span>
                          {getSortIcon("department")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-text">
                        <button
                          onClick={() => handleSort("status")}
                          className="flex items-center space-x-1 hover:text-primary transition-colors"
                        >
                          <span>Status</span>
                          {getSortIcon("status")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-text">
                        <button
                          onClick={() => handleSort("activeCases")}
                          className="flex items-center space-x-1 hover:text-primary transition-colors"
                        >
                          <span>Active Cases</span>
                          {getSortIcon("activeCases")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-text">
                        <button
                          onClick={() => handleSort("completedCases")}
                          className="flex items-center space-x-1 hover:text-primary transition-colors"
                        >
                          <span>Completed</span>
                          {getSortIcon("completedCases")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-text">
                        <button
                          onClick={() => handleSort("rating")}
                          className="flex items-center space-x-1 hover:text-primary transition-colors"
                        >
                          <span>Rating</span>
                          {getSortIcon("rating")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-text">
                        <button
                          onClick={() => handleSort("performance")}
                          className="flex items-center space-x-1 hover:text-primary transition-colors"
                        >
                          <span>Performance</span>
                          {getSortIcon("performance")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-text">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {currentWorkers.map((worker, index) => (
                        <motion.tr
                          key={worker.id || worker._id || index}
                          className="border-b border-gray-100 hover:bg-gray-50"
                          variants={tableRowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          transition={{ delay: index * 0.05 }}
                          whileHover={{
                            backgroundColor: "#f9fafb",
                            transition: { duration: 0.2 },
                          }}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-primary-50 rounded-full flex items-center justify-center mr-3">
                                <span className="text-primary font-medium">
                                  {worker.fullName
                                    ? worker.fullName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                    : "?"}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-text">
                                  {worker.fullName || "Unknown"}
                                </p>
                                <p className="text-sm text-text-light">
                                  {worker.email || "No email"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="capitalize text-text">
                              {worker.department}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {getStatusIcon(
                                worker.workStatus || worker.status
                              )}
                              <span
                                className={`ml-2 px-3 py-1 rounded text-xs font-medium min-w-[80px] text-center inline-block ${getStatusColor(
                                  worker.workStatus || worker.status
                                )}`}
                              >
                                {(
                                  worker.workStatus ||
                                  worker.status ||
                                  "available"
                                ).toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-text font-medium">
                              {worker.activeCases ||
                                worker.metrics?.activeComplaints ||
                                0}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <span className="text-text font-medium">
                                {worker.completedCases ||
                                  worker.metrics?.completedCount ||
                                  0}
                              </span>
                              <span className="text-text-light text-sm ml-1">
                                total
                              </span>
                              <br />
                              <span className="text-text-light text-sm">
                                +
                                {worker.completedToday ||
                                  worker.metrics?.completedToday ||
                                  0}{" "}
                                today
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <Award className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="text-text font-medium">
                                {worker.rating?.toFixed(1) || "4.5"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-medium ${getPerformanceColor(
                                worker.performanceScore || 85
                              )}`}
                            >
                              {worker.performanceScore || 85}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => viewWorkerDetails(worker)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal(worker)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-text-light">
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, sortedWorkers.length)} of{" "}
                    {sortedWorkers.length} workers
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, index) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = index + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = index + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + index;
                          } else {
                            pageNumber = currentPage - 2 + index;
                          }

                          return (
                            <button
                              key={pageNumber}
                              onClick={() => goToPage(pageNumber)}
                              className={`px-3 py-2 text-sm font-medium rounded-md ${
                                currentPage === pageNumber
                                  ? "bg-primary text-white"
                                  : "text-text-light hover:bg-gray-100"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </motion.div>

      {/* Worker Detail Modal */}
      {showDetailModal && selectedWorker && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-text">
                  Worker Details - {selectedWorker.name}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  ×
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <h4 className="text-lg font-medium text-text mb-4">
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-1">
                          Full Name
                        </label>
                        <p className="text-text-light">
                          {selectedWorker.fullName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-1">
                          Username
                        </label>
                        <p className="text-text-light">
                          {selectedWorker.username}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-1">
                          Email
                        </label>
                        <p className="text-text-light">
                          {selectedWorker.email}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-1">
                          Phone
                        </label>
                        <p className="text-text-light">
                          {selectedWorker.phone}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-1">
                          Department
                        </label>
                        <p className="text-text-light capitalize">
                          {selectedWorker.department}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Performance Stats */}
                <div className="space-y-6">
                  <Card>
                    <h4 className="text-lg font-medium text-text mb-4">
                      Performance
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-text">
                            Overall Score
                          </span>
                          <span
                            className={`text-sm font-bold ${getPerformanceColor(
                              selectedWorker.performanceScore
                            )}`}
                          >
                            {selectedWorker.performanceScore}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${selectedWorker.performanceScore}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-text-light">
                            Rating
                          </span>
                          <div className="flex items-center">
                            <Award className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm font-medium">
                              {selectedWorker.rating}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-text-light">
                            Active Cases
                          </span>
                          <span className="text-sm font-medium">
                            {selectedWorker.activeCases ||
                              selectedWorker.metrics?.activeComplaints ||
                              0}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-text-light">
                            Completed Cases
                          </span>
                          <span className="text-sm font-medium">
                            {selectedWorker.completedCases ||
                              selectedWorker.metrics?.completedCount ||
                              0}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-text-light">
                            Completed Today
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            +
                            {selectedWorker.completedToday ||
                              selectedWorker.metrics?.completedToday ||
                              0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <h4 className="text-lg font-medium text-text mb-4">
                      Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        {getStatusIcon(
                          selectedWorker.workStatus || selectedWorker.status
                        )}
                        <span
                          className={`ml-2 px-3 py-1 rounded text-xs font-medium min-w-[80px] text-center inline-block ${getStatusColor(
                            selectedWorker.workStatus || selectedWorker.status
                          )}`}
                        >
                          {(
                            selectedWorker.workStatus ||
                            selectedWorker.status ||
                            "available"
                          ).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-text-light">Last Active</p>
                        <p className="text-sm font-medium">
                          {new Date(selectedWorker.lastActive).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => openEditModal(selectedWorker)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Worker
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Worker Modal */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-text">
                  Add New Worker
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddWorkerModal(false)}
                >
                  ×
                </Button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddWorker();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newWorkerData.username}
                    onChange={(e) =>
                      handleWorkerInputChange("username", e.target.value)
                    }
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newWorkerData.fullName}
                    onChange={(e) =>
                      handleWorkerInputChange("fullName", e.target.value)
                    }
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={newWorkerData.email}
                    onChange={(e) =>
                      handleWorkerInputChange("email", e.target.value)
                    }
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={newWorkerData.phone}
                    onChange={(e) =>
                      handleWorkerInputChange("phone", e.target.value)
                    }
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={newWorkerData.department}
                    onChange={(e) =>
                      handleWorkerInputChange("department", e.target.value)
                    }
                    options={DEPARTMENTS.filter((dept) => dept.value !== "all")}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    value={newWorkerData.password}
                    onChange={(e) =>
                      handleWorkerInputChange("password", e.target.value)
                    }
                    placeholder="Enter password"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddWorkerModal(false)}
                    disabled={addWorkerLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={addWorkerLoading}
                  >
                    {addWorkerLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Worker
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Worker Modal */}
      {showEditWorkerModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-text">Edit Worker</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditWorkerModal(false)}
                >
                  ×
                </Button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditWorker();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={editWorkerData.fullName}
                    onChange={(e) =>
                      setEditWorkerData((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={editWorkerData.email}
                    onChange={(e) =>
                      setEditWorkerData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={editWorkerData.phone}
                    onChange={(e) =>
                      setEditWorkerData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={editWorkerData.department}
                    onChange={(e) =>
                      setEditWorkerData((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    options={DEPARTMENTS.filter((dept) => dept.value !== "all")}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditWorkerModal(false)}
                    disabled={editWorkerLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={editWorkerLoading}
                  >
                    {editWorkerLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Update Worker
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WorkersPage;
