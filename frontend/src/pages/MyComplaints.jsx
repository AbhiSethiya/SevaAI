import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import { complaintAPI, STATUS_OPTIONS, PRIORITY_OPTIONS } from "../lib/api";
import { getPriorityColor, getComplaintStatusColor } from "../utils/colorUtils";

const MyComplaints = () => {
  const { user, openAuthModal } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    timeframe: "all",
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [complaintsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      openAuthModal();
    }
  }, [user, openAuthModal]);

  // Fetch user complaints on component mount and when filters change
  useEffect(() => {
    if (user) {
      fetchMyComplaints();
    }
  }, [user, filters]);

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the existing getAllComplaints endpoint with user filtering
      // We'll modify this to call a specific user complaints endpoint
      const response = await complaintAPI.getMyComplaints(filters);

      const formattedComplaints = (response.data || []).map((complaint) => ({
        ...complaint,
        id: complaint._id || complaint.id,
      }));

      setComplaints(formattedComplaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setError(error.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };

  // Filter and sort complaints
  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.ticketId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filters.status === "all" || complaint.status === filters.status;
    const matchesPriority =
      filters.priority === "all" || complaint.priority === filters.priority;

    let matchesTimeframe = true;
    if (filters.timeframe !== "all") {
      const now = new Date();
      const complaintDate = new Date(complaint.createdAt);
      const diffTime = Math.abs(now - complaintDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (filters.timeframe) {
        case "7days":
          matchesTimeframe = diffDays <= 7;
          break;
        case "30days":
          matchesTimeframe = diffDays <= 30;
          break;
        case "3months":
          matchesTimeframe = diffDays <= 90;
          break;
        case "6months":
          matchesTimeframe = diffDays <= 180;
          break;
        case "1year":
          matchesTimeframe = diffDays <= 365;
          break;
      }
    }

    return (
      matchesSearch && matchesStatus && matchesPriority && matchesTimeframe
    );
  });

  // Sort complaints
  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle date sorting
    if (sortConfig.key === "createdAt" || sortConfig.key === "updatedAt") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // Handle string sorting
    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const indexOfLastComplaint = currentPage * complaintsPerPage;
  const indexOfFirstComplaint = indexOfLastComplaint - complaintsPerPage;
  const currentComplaints = sortedComplaints.slice(
    indexOfFirstComplaint,
    indexOfLastComplaint
  );
  const totalPages = Math.ceil(sortedComplaints.length / complaintsPerPage);

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const openDetailModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedComplaint(null);
    setShowDetailModal(false);
  };

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto p-8 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Login Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to view your complaints and track their status.
          </p>
          <Button onClick={openAuthModal} className="w-full">
            Login to Continue
          </Button>
        </Card>
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
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.9 },
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
      className="min-h-screen bg-gray-50"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <motion.h1
            className="text-3xl font-bold text-gray-900 mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            My Complaints
          </motion.h1>
          <motion.p
            className="text-gray-600"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Track the status of your submitted complaints and view their
            history.
          </motion.p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
              },
            },
          }}
        >
          <motion.div variants={statsVariants} whileHover={{ scale: 1.05 }}>
            <Card className="p-6">
              <div className="flex items-center">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <FileText className="w-8 h-8 text-blue-500 mr-3" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Complaints
                  </p>
                  <motion.p
                    className="text-2xl font-bold text-gray-900"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  >
                    {complaints.length}
                  </motion.p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div variants={statsVariants} whileHover={{ scale: 1.05 }}>
            <Card className="p-6">
              <div className="flex items-center">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Clock className="w-8 h-8 text-yellow-500 mr-3" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <motion.p
                    className="text-2xl font-bold text-gray-900"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  >
                    {complaints.filter((c) => c.status === "pending").length}
                  </motion.p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div variants={statsVariants} whileHover={{ scale: 1.05 }}>
            <Card className="p-6">
              <div className="flex items-center">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <AlertCircle className="w-8 h-8 text-orange-500 mr-3" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    In Progress
                  </p>
                  <motion.p
                    className="text-2xl font-bold text-gray-900"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                  >
                    {
                      complaints.filter((c) => c.status === "in-progress")
                        .length
                    }
                  </motion.p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div variants={statsVariants} whileHover={{ scale: 1.05 }}>
            <Card className="p-6">
              <div className="flex items-center">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <motion.p
                    className="text-2xl font-bold text-gray-900"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  >
                    {complaints.filter((c) => c.status === "resolved").length}
                  </motion.p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Card className="p-6 mb-8">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
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
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </motion.div>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Input
                      type="text"
                      placeholder="Search by ticket ID, description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value="all">All Status</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Select
                    value={filters.priority}
                    onChange={(e) =>
                      setFilters({ ...filters, priority: e.target.value })
                    }
                  >
                    <option value="all">All Priorities</option>
                    {PRIORITY_OPTIONS.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </Select>
                </motion.div>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Period
                </label>
                <Select
                  value={filters.timeframe}
                  onChange={(e) =>
                    setFilters({ ...filters, timeframe: e.target.value })
                  }
                >
                  <option value="all">All Time</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                </Select>
              </motion.div>
            </motion.div>
          </Card>
        </motion.div>

        {/* Complaints Table */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.005 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Card className="overflow-hidden">
            {loading ? (
              <motion.div
                className="flex items-center justify-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="ml-2 text-gray-600">
                  Loading your complaints...
                </span>
              </motion.div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
                <Button onClick={fetchMyComplaints} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : sortedComplaints.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No complaints found</p>
                <p className="text-sm text-gray-500">
                  {complaints.length === 0
                    ? "You haven't submitted any complaints yet."
                    : "Try adjusting your search or filters."}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("ticketId")}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Ticket ID</span>
                            {getSortIcon("ticketId")}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("description")}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Description</span>
                            {getSortIcon("description")}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("department")}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Department</span>
                            {getSortIcon("department")}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("priority")}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Priority</span>
                            {getSortIcon("priority")}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("status")}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Status</span>
                            {getSortIcon("status")}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("createdAt")}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Submitted</span>
                            {getSortIcon("createdAt")}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <motion.tbody
                      className="bg-white divide-y divide-gray-200"
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
                      <AnimatePresence>
                        {currentComplaints.map((complaint, index) => (
                          <motion.tr
                            key={complaint.id}
                            className="hover:bg-gray-50"
                            variants={{
                              hidden: { opacity: 0, y: 20 },
                              visible: { opacity: 1, y: 0 },
                            }}
                            whileHover={{
                              scale: 1.01,
                              backgroundColor: "#f9fafb",
                              transition: { duration: 0.2 },
                            }}
                            layout
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-blue-600">
                                {complaint.ticketId}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {complaint.description ||
                                  complaint.refinedText ||
                                  complaint.rawText}
                              </div>
                              {complaint.location && (
                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  <span className="truncate max-w-xs">
                                    {complaint.location}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900 capitalize">
                                {complaint.department}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                                  complaint.priority
                                )}`}
                              >
                                {complaint.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(complaint.status)}
                                <span
                                  className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplaintStatusColor(
                                    complaint.status
                                  )}`}
                                >
                                  {complaint.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(complaint.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDetailModal(complaint)}
                                className="mr-2"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </motion.tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <Button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="outline"
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        variant="outline"
                      >
                        Next
                      </Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">
                            {indexOfFirstComplaint + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(
                              indexOfLastComplaint,
                              sortedComplaints.length
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {sortedComplaints.length}
                          </span>{" "}
                          results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <Button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            variant="outline"
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            Previous
                          </Button>
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <Button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              variant={
                                currentPage === page ? "primary" : "outline"
                              }
                              className="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                            >
                              {page}
                            </Button>
                          ))}
                          <Button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            Next
                          </Button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </motion.div>

        {/* Detail Modal */}
        {showDetailModal && selectedComplaint && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Complaint Details
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closeDetailModal}
                  >
                    Close
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Ticket ID
                      </label>
                      <p className="mt-1 text-sm text-gray-900 font-mono">
                        {selectedComplaint.ticketId}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <div className="mt-1 flex items-center">
                        {getStatusIcon(selectedComplaint.status)}
                        <span
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplaintStatusColor(
                            selectedComplaint.status
                          )}`}
                        >
                          {selectedComplaint.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Department
                      </label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">
                        {selectedComplaint.department}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <span
                        className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                          selectedComplaint.priority
                        )}`}
                      >
                        {selectedComplaint.priority}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Submitted On
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedComplaint.createdAt)}
                      </p>
                    </div>
                    {selectedComplaint.updatedAt &&
                      selectedComplaint.updatedAt !==
                        selectedComplaint.createdAt && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Last Updated
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {formatDate(selectedComplaint.updatedAt)}
                          </p>
                        </div>
                      )}
                  </div>

                  {selectedComplaint.location && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <div className="mt-1 flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {selectedComplaint.location}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedComplaint.description ||
                        selectedComplaint.refinedText ||
                        selectedComplaint.rawText}
                    </p>
                  </div>

                  {selectedComplaint.assignedTo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Assigned To
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedComplaint.assignedTo.fullName ||
                          selectedComplaint.assignedTo.username}
                      </p>
                    </div>
                  )}

                  {selectedComplaint.proofImage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proof Image
                      </label>
                      <img
                        src={selectedComplaint.proofImage}
                        alt="Complaint proof"
                        className="max-w-full h-auto rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  {selectedComplaint.history &&
                    selectedComplaint.history.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status History
                        </label>
                        <div className="space-y-2">
                          {selectedComplaint.history.map((entry, index) => (
                            <div
                              key={index}
                              className="flex items-center text-sm"
                            >
                              <div className="flex items-center">
                                {getStatusIcon(entry.status)}
                                <span className="ml-2 capitalize">
                                  {entry.status}
                                </span>
                              </div>
                              <span className="mx-2 text-gray-400">•</span>
                              <span className="text-gray-500">
                                {formatDate(entry.timestamp || entry.createdAt)}
                              </span>
                              {entry.note && (
                                <>
                                  <span className="mx-2 text-gray-400">•</span>
                                  <span className="text-gray-600">
                                    {entry.note}
                                  </span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyComplaints;
