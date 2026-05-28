import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Filter,
  Eye,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Edit,
  Trash2,
  Download,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
} from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Textarea from "../components/common/Textarea";
import {
  complaintAPI,
  userAPI,
  hodAPI,
  workerAPI,
  DEPARTMENTS,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
} from "../lib/api";
import {
  DepartmentChart,
  StatusChart,
  PriorityChart,
} from "../components/common/Charts";
import { getPriorityColor, getComplaintStatusColor } from "../utils/colorUtils";

const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    department: "all",
    status: "all",
    priority: "all",
    timeframe: "30days",
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showChartsView, setShowChartsView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [complaintsPerPage] = useState(25);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {},
    byDepartment: {},
    byPriority: {},
  });
  const [workers, setWorkers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Fetch complaints on component mount and when filters change
  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await complaintAPI.getAllComplaints(filters);

      // Ensure complaints have proper ID field
      const formattedComplaints = (response.data || []).map((complaint) => ({
        ...complaint,
        id: complaint._id || complaint.id,
      }));

      setComplaints(formattedComplaints);

      // Debug the response structure
      console.log("Full API response:", response);
      console.log("Response stats:", response.stats);

      // Handle stats - the backend returns stats directly or nested
      let statsData = response.stats || {
        total: response.total || 0,
        byStatus: response.byStatus || {},
        byDepartment: response.byDepartment || {},
        byPriority: response.byPriority || {},
      };

      // If stats are empty or missing, calculate from complaints data
      if (!statsData.total && formattedComplaints.length > 0) {
        statsData = {
          total: formattedComplaints.length,
          byStatus: {},
          byDepartment: {},
          byPriority: {},
        };

        formattedComplaints.forEach((complaint) => {
          // Status stats
          statsData.byStatus[complaint.status] =
            (statsData.byStatus[complaint.status] || 0) + 1;
          // Department stats
          statsData.byDepartment[complaint.department] =
            (statsData.byDepartment[complaint.department] || 0) + 1;
          // Priority stats
          statsData.byPriority[complaint.priority] =
            (statsData.byPriority[complaint.priority] || 0) + 1;
        });
      }

      setStats(statsData);
    } catch (err) {
      setError(err.message || "Failed to fetch complaints");
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  // Helper function to get nested values for sorting
  const getNestedValue = (obj, key) => {
    switch (key) {
      case "ticketId":
        return obj.ticketId || "";
      case "location":
        return obj.location || "";
      case "department":
        return obj.department || "";
      case "priority":
        return obj.priority || "";
      case "status":
        return obj.status || "";
      case "assignedWorker":
        return obj.assignedWorker?.name || obj.assignedWorker || "";
      case "createdAt":
        return obj.createdAt || "";
      default:
        return obj[key] || "";
    }
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Function to get sort icon
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4 text-primary" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary" />
    );
  };

  const filteredComplaints = complaints.filter((complaint) => {
    if (!searchTerm) return true;
    return (
      complaint.ticketId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Apply sorting to filtered complaints
  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
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

  // Pagination logic - use sortedComplaints instead of filteredComplaints
  const totalPages = Math.ceil(sortedComplaints.length / complaintsPerPage);
  const startIndex = (currentPage - 1) * complaintsPerPage;
  const endIndex = startIndex + complaintsPerPage;
  const currentComplaints = sortedComplaints.slice(startIndex, endIndex);

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

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "assigned":
        return <UserPlus className="h-4 w-4 text-yellow-500" />;
      case "in-progress":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "closed":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      // Legacy support for old status values
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "denied":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    return getComplaintStatusColor(status, "light");
  };

  const getPriorityColorLocal = (priority) => {
    return getPriorityColor(priority, "light");
  };

  // Fetch workers
  const fetchWorkers = async () => {
    try {
      const response = await userAPI.getAllUsers({ role: "worker" });
      setWorkers(response.data || []);
    } catch (error) {
      console.error("Error fetching workers:", error);
    }
  };

  // Get workers filtered by department
  const getWorkersByDepartment = (department) => {
    return workers
      .filter((worker) => worker.department === department)
      .sort((a, b) => {
        // Sort by active cases (less tasks first)
        const aActiveCases = a.activeCases || 0;
        const bActiveCases = b.activeCases || 0;
        return aActiveCases - bActiveCases;
      })
      .map((worker) => ({
        value: worker._id || worker.id,
        label: `${worker.fullName || worker.username} (${
          worker.activeCases || 0
        } active)`,
      }));
  };

  // Handle worker assignment
  const handleAssignWorker = async (complaintId, workerId) => {
    try {
      if (!workerId) {
        // Handle unassignment
        const confirmUnassign = window.confirm(
          "Are you sure you want to unassign this worker?"
        );
        if (!confirmUnassign) return;

        // You'll need to implement an unassign API endpoint
        // For now, we'll skip this functionality
        alert("Unassignment functionality not yet implemented");
        return;
      }

      // Use the proper worker assignment API
      await workerAPI.assignComplaint(complaintId, workerId, 24); // Default 24 hours

      // Refresh complaints after assignment
      fetchComplaints();
      alert("Worker assigned successfully!");
    } catch (error) {
      console.error("Error assigning worker:", error);
      alert("Failed to assign worker. Please try again.");
    }
  }; // Fetch workers when component mounts
  useEffect(() => {
    fetchWorkers();
  }, []);

  const viewComplaintDetails = async (complaint) => {
    try {
      // Fetch detailed complaint information
      const detailedComplaint = await complaintAPI.getComplaintByTicket(
        complaint.ticketId
      );
      setSelectedComplaint({
        ...complaint,
        ...detailedComplaint,
      });
      setShowDetailModal(true);
    } catch (err) {
      console.error("Error fetching complaint details:", err);
      // Show complaint with available data
      setSelectedComplaint(complaint);
      setShowDetailModal(true);
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      console.log("Updating complaint status:", { complaintId, newStatus });
      await hodAPI.updateComplaintStatus(complaintId, newStatus);

      // Update the local state to reflect the change
      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id === complaintId
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );

      // Show success message
      console.log(`Complaint status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating complaint status:", err);
      // Optionally show error message to user
    }
  };

  const editComplaint = (complaint) => {
    setEditingComplaint({ ...complaint });
    setShowEditModal(true);
  };

  const saveComplaintEdit = async () => {
    try {
      setLoading(true);
      console.log("Saving complaint edit:", {
        id: editingComplaint.id,
        data: editingComplaint,
      });

      // Prepare the data with proper coordinate formatting
      const complaintData = {
        ...editingComplaint,
        coordinates:
          editingComplaint.lat && editingComplaint.lng
            ? {
                lat: parseFloat(editingComplaint.lat),
                lng: parseFloat(editingComplaint.lng),
              }
            : null,
      };

      // Call API to update complaint
      await complaintAPI.updateComplaint(editingComplaint.id, complaintData);

      // Update local state
      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id === editingComplaint.id
            ? { ...complaint, ...editingComplaint }
            : complaint
        )
      );

      setShowEditModal(false);
      setEditingComplaint(null);
      console.log("Complaint updated successfully");
    } catch (err) {
      console.error("Error updating complaint:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportComplaints = () => {
    // Create CSV content
    const headers = [
      "Ticket ID",
      "Location",
      "Latitude",
      "Longitude",
      "Department",
      "Priority",
      "Status",
      "Created At",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredComplaints.map((complaint) =>
        [
          complaint.ticketId,
          complaint.location || "N/A",
          complaint.lat || "N/A",
          complaint.lng || "N/A",
          complaint.department,
          complaint.priority,
          complaint.status,
          new Date(complaint.createdAt).toLocaleDateString(),
        ].join(",")
      ),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `complaints_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Animation variants
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
      className="space-y-4 sm:space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        variants={itemVariants}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-text">
            Complaints Management
          </h1>
          <p className="text-sm sm:text-base text-text-light">
            Monitor and manage all municipal complaints
          </p>
        </motion.div>
        <motion.div
          className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4"
          variants={itemVariants}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={showChartsView ? "primary" : "outline"}
              onClick={() => setShowChartsView(!showChartsView)}
              className="w-full sm:w-auto"
            >
              <motion.div
                animate={{ rotate: showChartsView ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
              </motion.div>
              {showChartsView ? "Hide Charts" : "Show Charts"}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="primary"
              onClick={exportComplaints}
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
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
        <motion.div
          variants={cardVariants}
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card>
            <div className="flex items-center">
              <motion.div
                className="p-3 rounded-lg bg-blue-50 mr-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <FileText className="h-6 w-6 text-blue-600" />
              </motion.div>
              <div>
                <p className="text-text-light text-sm">Total Complaints</p>
                <motion.p
                  className="text-xl sm:text-2xl font-bold text-text"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                >
                  {stats.total || 0}
                </motion.p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card>
            <div className="flex items-center">
              <motion.div
                className="p-3 rounded-lg bg-yellow-50 mr-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Clock className="h-6 w-6 text-yellow-600" />
              </motion.div>
              <div>
                <p className="text-text-light text-sm">Pending</p>
                <motion.p
                  className="text-xl sm:text-2xl font-bold text-text"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  {stats.byStatus?.pending || 0}
                </motion.p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card>
            <div className="flex items-center">
              <motion.div
                className="p-3 rounded-lg bg-purple-50 mr-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <AlertCircle className="h-6 w-6 text-purple-600" />
              </motion.div>
              <div>
                <p className="text-text-light text-sm">In Progress</p>
                <motion.p
                  className="text-xl sm:text-2xl font-bold text-text"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                >
                  {stats.byStatus?.["in-progress"] || 0}
                </motion.p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card>
            <div className="flex items-center">
              <motion.div
                className="p-3 rounded-lg bg-green-50 mr-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <CheckCircle className="h-6 w-6 text-green-600" />
              </motion.div>
              <div>
                <p className="text-text-light text-sm">Resolved</p>
                <motion.p
                  className="text-xl sm:text-2xl font-bold text-text"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                >
                  {stats.byStatus?.resolved || 0}
                </motion.p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.005 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Card>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            {/* Search - takes 2 columns on large screens */}
            <motion.div
              className="sm:col-span-2 lg:col-span-2"
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              <label className="block text-sm font-medium text-text mb-2">
                Search
              </label>
              <div className="relative">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                </motion.div>
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Input
                    placeholder="Search by ticket ID, location, or department..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Department Filter */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              <label className="block text-sm font-medium text-text mb-2">
                Department
              </label>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Select
                  value={filters.department}
                  onChange={(e) =>
                    handleFilterChange("department", e.target.value)
                  }
                  options={DEPARTMENTS}
                />
              </motion.div>
            </motion.div>

            {/* Status Filter */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              <label className="block text-sm font-medium text-text mb-2">
                Status
              </label>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  options={STATUS_OPTIONS}
                />
              </motion.div>
            </motion.div>

            {/* Priority Filter */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              <label className="block text-sm font-medium text-text mb-2">
                Priority
              </label>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Select
                  value={filters.priority}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value)
                  }
                  options={PRIORITY_OPTIONS}
                />
              </motion.div>
            </motion.div>

            {/* Timeframe Filter */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              <label className="block text-sm font-medium text-text mb-2">
                Timeframe
              </label>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Select
                  value={filters.timeframe}
                  onChange={(e) =>
                    handleFilterChange("timeframe", e.target.value)
                  }
                  options={[
                    { value: "all", label: "All Time" },
                    { value: "7days", label: "Last 7 days" },
                    { value: "30days", label: "Last 30 days" },
                    { value: "3months", label: "Last 3 months" },
                    { value: "6months", label: "Last 6 months" },
                    { value: "1year", label: "Last year" },
                  ]}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </Card>
      </motion.div>

      {/* Charts Section - Only show when toggled */}
      {showChartsView && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <DepartmentChart departmentStats={stats.byDepartment} />
          </div>
          <div>
            <StatusChart statusStats={stats.byStatus} />
          </div>
          <div>
            <PriorityChart priorityStats={stats.byPriority} />
          </div>
        </div>
      )}

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <div className="text-center text-red-600">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                >
                  <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                </motion.div>
                <p className="text-lg font-medium">Error Loading Complaints</p>
                <p className="text-sm text-text-light">{error}</p>
                <Button
                  variant="outline"
                  onClick={fetchComplaints}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complaints List */}
      {!error && (
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.005 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <motion.h3
                className="text-lg sm:text-xl font-semibold text-text"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Complaints ({sortedComplaints.length})
              </motion.h3>
              {totalPages > 1 && (
                <motion.div
                  className="text-sm text-text-light"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, sortedComplaints.length)} of{" "}
                  {sortedComplaints.length}
                </motion.div>
              )}
            </div>

            {sortedComplaints.length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                </motion.div>
                <h4 className="text-lg font-medium text-gray-600 mb-2">
                  No Complaints Found
                </h4>
                <p className="text-gray-500">
                  No complaints match your current filters.
                </p>
              </motion.div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-text text-sm sm:text-base">
                          <button
                            onClick={() => handleSort("ticketId")}
                            className="flex items-center space-x-1 hover:text-primary transition-colors"
                          >
                            <span>Ticket ID</span>
                            {getSortIcon("ticketId")}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-text">
                          <button
                            onClick={() => handleSort("location")}
                            className="flex items-center space-x-1 hover:text-primary transition-colors"
                          >
                            <span>Location</span>
                            {getSortIcon("location")}
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
                            onClick={() => handleSort("priority")}
                            className="flex items-center space-x-1 hover:text-primary transition-colors"
                          >
                            <span>Priority</span>
                            {getSortIcon("priority")}
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
                            onClick={() => handleSort("assignedWorker")}
                            className="flex items-center space-x-1 hover:text-primary transition-colors"
                          >
                            <span>Assigned Worker</span>
                            {getSortIcon("assignedWorker")}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-text">
                          Lat & Long
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-text">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentComplaints.map((complaint, index) => (
                        <tr
                          key={complaint.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <span className="font-medium text-primary">
                              {complaint.ticketId}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-text-light">
                                {complaint.location || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="capitalize text-text">
                              {complaint.department}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded text-xs font-medium min-w-[70px] text-center inline-block ${getPriorityColorLocal(
                                complaint.priority
                              )}`}
                            >
                              {complaint.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative inline-block dropdown-container">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(
                                    openDropdown === complaint.id
                                      ? null
                                      : complaint.id
                                  );
                                }}
                                className="inline-flex items-center justify-between w-32 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <div className="flex items-center">
                                  {getStatusIcon(complaint.status)}
                                  <span className="ml-2 truncate capitalize">
                                    {complaint.status.replace("-", " ")}
                                  </span>
                                </div>
                                <ChevronDown className="w-4 h-4 ml-1" />
                              </button>

                              {openDropdown === complaint.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setOpenDropdown(null)}
                                  />
                                  <div className="absolute left-0 z-50 w-48 mt-1 bg-white border border-gray-200 rounded-md shadow-xl">
                                    <div className="py-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateComplaintStatus(
                                            complaint.id,
                                            "pending"
                                          );
                                          setOpenDropdown(null);
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 hover:text-orange-900"
                                      >
                                        <Clock className="w-4 h-4 mr-3" />
                                        Pending
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateComplaintStatus(
                                            complaint.id,
                                            "assigned"
                                          );
                                          setOpenDropdown(null);
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 hover:text-purple-900"
                                      >
                                        <UserPlus className="w-4 h-4 mr-3" />
                                        Assigned
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateComplaintStatus(
                                            complaint.id,
                                            "in-progress"
                                          );
                                          setOpenDropdown(null);
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 hover:text-blue-900"
                                      >
                                        <AlertCircle className="w-4 h-4 mr-3" />
                                        In Progress
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateComplaintStatus(
                                            complaint.id,
                                            "resolved"
                                          );
                                          setOpenDropdown(null);
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 hover:text-green-900"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-3" />
                                        Resolved
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateComplaintStatus(
                                            complaint.id,
                                            "closed"
                                          );
                                          setOpenDropdown(null);
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                      >
                                        <XCircle className="w-4 h-4 mr-3" />
                                        Closed
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateComplaintStatus(
                                            complaint.id,
                                            "rejected"
                                          );
                                          setOpenDropdown(null);
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900"
                                      >
                                        <XCircle className="w-4 h-4 mr-3" />
                                        Rejected
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="min-w-[150px]">
                              {complaint.assignedWorker ? (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-text">
                                    {complaint.assignedWorker.fullName ||
                                      complaint.assignedWorker.username}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleAssignWorker(complaint.id, "")
                                    }
                                    className="ml-2 text-xs px-2 py-1"
                                  >
                                    Unassign
                                  </Button>
                                </div>
                              ) : (
                                <Select
                                  value=""
                                  onChange={(e) =>
                                    handleAssignWorker(
                                      complaint.id,
                                      e.target.value
                                    )
                                  }
                                  options={[
                                    {
                                      value: "",
                                      label: "Select a worker...",
                                    },
                                    ...getWorkersByDepartment(
                                      complaint.department
                                    ),
                                  ]}
                                  className="text-sm"
                                />
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-text-light text-sm">
                              <div>
                                Lat:{" "}
                                {complaint.lat
                                  ? parseFloat(complaint.lat).toFixed(4)
                                  : "N/A"}
                              </div>
                              <div>
                                Lng:{" "}
                                {complaint.lng
                                  ? parseFloat(complaint.lng).toFixed(4)
                                  : "N/A"}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => editComplaint(complaint)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit Complaint"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-text-light">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, sortedComplaints.length)} of{" "}
                  {sortedComplaints.length} complaints
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
          </Card>
        </motion.div>
      )}

      {/* Complaint Detail Modal */}
      {showDetailModal && selectedComplaint && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-text">
                  Complaint Details - {selectedComplaint.ticketId}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Location
                  </label>
                  <p className="text-text-light">
                    {selectedComplaint.location || "N/A"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Department
                    </label>
                    <p className="text-text-light capitalize">
                      {selectedComplaint.department}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Category
                    </label>
                    <p className="text-text-light capitalize">
                      {selectedComplaint.category || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Priority
                    </label>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColorLocal(
                        selectedComplaint.priority
                      )}`}
                    >
                      {selectedComplaint.priority}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Status
                    </label>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        selectedComplaint.status
                      )}`}
                    >
                      {selectedComplaint.status.replace("-", " ").toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Description
                  </label>
                  <p className="text-text-light bg-gray-50 p-3 rounded-lg">
                    {selectedComplaint.refinedText ||
                      selectedComplaint.rawText ||
                      "No description available"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Created At
                  </label>
                  <p className="text-text-light">
                    {new Date(selectedComplaint.createdAt).toLocaleString()}
                  </p>
                </div>

                {(selectedComplaint.lat || selectedComplaint.lng) && (
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Coordinates
                    </label>
                    <p className="text-text-light">
                      Lat: {selectedComplaint.lat || "N/A"}, Lng:{" "}
                      {selectedComplaint.lng || "N/A"}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </Button>
                <Button variant="primary">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Complaint
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Complaint Modal */}
      {showEditModal && editingComplaint && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          {" "}
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-text">
                  Edit Complaint - {editingComplaint.ticketId}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingComplaint(null);
                  }}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Location
                  </label>
                  <Input
                    value={editingComplaint.location || ""}
                    onChange={(e) =>
                      setEditingComplaint({
                        ...editingComplaint,
                        location: e.target.value,
                      })
                    }
                    placeholder="Enter location"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Latitude
                    </label>
                    <Input
                      value={editingComplaint.lat || ""}
                      onChange={(e) =>
                        setEditingComplaint({
                          ...editingComplaint,
                          lat: e.target.value,
                        })
                      }
                      placeholder="Enter latitude"
                      type="number"
                      step="any"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Longitude
                    </label>
                    <Input
                      value={editingComplaint.lng || ""}
                      onChange={(e) =>
                        setEditingComplaint({
                          ...editingComplaint,
                          lng: e.target.value,
                        })
                      }
                      placeholder="Enter longitude"
                      type="number"
                      step="any"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Department
                    </label>
                    <Select
                      value={editingComplaint.department || ""}
                      onChange={(e) =>
                        setEditingComplaint({
                          ...editingComplaint,
                          department: e.target.value,
                        })
                      }
                      options={DEPARTMENTS}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Priority
                    </label>
                    <Select
                      value={editingComplaint.priority || ""}
                      onChange={(e) =>
                        setEditingComplaint({
                          ...editingComplaint,
                          priority: e.target.value,
                        })
                      }
                      options={PRIORITY_OPTIONS}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Description
                  </label>
                  <Textarea
                    value={editingComplaint.description || ""}
                    onChange={(e) =>
                      setEditingComplaint({
                        ...editingComplaint,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="Enter complaint description"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingComplaint(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={saveComplaintEdit}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ComplaintsPage;
