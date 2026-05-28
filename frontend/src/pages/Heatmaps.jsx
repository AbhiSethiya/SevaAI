import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  Filter,
  Calendar,
  BarChart3,
  TrendingUp,
  MapPin,
  Layers,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Select from "../components/common/Select";
import HeatMap from "../components/HeatMap";

const Heatmaps = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("30days");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [viewMode, setViewMode] = useState("heatmap");
  const [showMarkers, setShowMarkers] = useState(false);
  const [heatmapData, setHeatmapData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const statsVariants = {
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

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "roads", label: "Roads & Transportation" },
    { value: "water", label: "Water Supply" },
    { value: "electricity", label: "Electricity" },
    { value: "waste", label: "Waste Management" },
    { value: "drainage", label: "Drainage & Sewerage" },
  ];

  const timeframes = [
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "3months", label: "Last 3 Months" },
    { value: "6months", label: "Last 6 Months" },
    { value: "1year", label: "Last Year" },
  ];

  const departments = [
    { value: "all", label: "All Departments" },
    { value: "road", label: "Roads" },
    { value: "water", label: "Water Supply" },
    { value: "electricity", label: "Electricity" },
    { value: "waste", label: "Waste Management" },
    { value: "drainage", label: "Drainage" },
    { value: "other", label: "Other" },
  ];

  const priorities = [
    { value: "all", label: "All Priorities" },
    { value: "High", label: "High Priority" },
    { value: "Medium", label: "Medium Priority" },
    { value: "Low", label: "Low Priority" },
  ];

  // Fetch complaints data
  const fetchComplaintsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);
      if (selectedPriority !== "all")
        params.append("priority", selectedPriority);
      if (selectedDepartment !== "all")
        params.append("department", selectedDepartment);
      if (selectedTimeframe !== "all")
        params.append("timeframe", selectedTimeframe);

      const response = await fetch(`/api/complaints/all?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch complaints data");
      }

      const result = await response.json();

      // The API returns { total, data, heatmapData, stats } directly
      if (result.data) {
        setHeatmapData(result.heatmapData || result.data);
        setStats(result.stats);
      } else {
        throw new Error(result.message || "Failed to fetch data");
      }
    } catch (err) {
      console.error("Error fetching complaints data:", err);
      setError(err.message);
      setHeatmapData([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchComplaintsData();
  }, [
    selectedCategory,
    selectedPriority,
    selectedDepartment,
    selectedTimeframe,
  ]);

  // Display stats with real data
  const displayStats = stats
    ? [
        {
          label: "Total Complaints",
          value: stats.total?.toString() || "0",
          change: "+12%",
          trend: "up",
          color: "text-primary",
        },
        {
          label: "Resolved",
          value: stats.byStatus?.resolved?.toString() || "0",
          change: "+8%",
          trend: "up",
          color: "text-green-600",
        },
        {
          label: "Pending",
          value: stats.byStatus?.pending?.toString() || "0",
          change: "-15%",
          trend: "down",
          color: "text-purple-600",
        },
        {
          label: "High Priority",
          value: stats.byPriority?.High?.toString() || "0",
          change: "+3",
          trend: "up",
          color: "text-orange-600",
        },
      ]
    : [
        {
          label: "Total Complaints",
          value: "Loading...",
          change: "",
          trend: "up",
          color: "text-primary",
        },
        {
          label: "Resolved",
          value: "Loading...",
          change: "",
          trend: "up",
          color: "text-green-600",
        },
        {
          label: "Pending",
          value: "Loading...",
          change: "",
          trend: "down",
          color: "text-purple-600",
        },
        {
          label: "High Priority",
          value: "Loading...",
          change: "",
          trend: "up",
          color: "text-orange-600",
        },
      ];

  const hotspots =
    stats && heatmapData.length > 0
      ? [
          // Generate hotspots from real data
          ...Object.entries(stats.byDepartment || {})
            .map(([dept, count], index) => ({
              area: `${
                dept.charAt(0).toUpperCase() + dept.slice(1)
              } Department Areas`,
              complaints: count,
              category: dept.charAt(0).toUpperCase() + dept.slice(1),
              severity: count > 50 ? "high" : count > 20 ? "medium" : "low",
            }))
            .slice(0, 5),
        ]
      : [
          {
            area: "Loading...",
            complaints: 0,
            category: "Loading",
            severity: "low",
          },
        ];

  const getSeverityColor = (severity) => {
    switch (severity) {
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

  return (
    <motion.div
      className="min-h-screen bg-background-light py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              delay: 0.3,
            }}
          >
            <motion.div
              className="w-16 h-16 bg-primary rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 1,
                }}
              >
                <BarChart3 className="h-8 w-8 text-white" />
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.h1
            className="text-3xl font-bold text-text mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Complaint Heatmaps
          </motion.h1>
          <motion.p
            className="text-xl text-text-light max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Visualize complaint distribution and trends across the city
          </motion.p>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <Card className="mb-8">
            <motion.div
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="flex items-center">
                <motion.div
                  animate={{ rotate: [0, 90, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 2,
                  }}
                >
                  <Filter className="h-5 w-5 text-primary mr-2" />
                </motion.div>
                <h2 className="text-xl font-semibold text-text">
                  Filter & Analysis Options
                </h2>
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.9,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <Select
                  label="Category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={categories}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Select
                  label="Department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  options={departments}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Select
                  label="Time Period"
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  options={timeframes}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Select
                  label="Priority Level"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  options={priorities}
                />
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <p>Error loading data: {error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Statistics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 1.2,
              },
            },
          }}
          initial="hidden"
          animate="visible"
        >
          {displayStats.map((stat, index) => (
            <motion.div
              key={index}
              variants={statsVariants}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                transition: { duration: 0.2 },
              }}
            >
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <motion.p
                      className="text-text-light text-sm font-bold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.4 + index * 0.1 }}
                    >
                      {stat.label}
                    </motion.p>
                    <motion.p
                      className={`text-2xl font-bold ${stat.color}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 1.5 + index * 0.1,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      {stat.value}
                    </motion.p>
                    {stat.change && (
                      <motion.p
                        className={`text-sm flex items-center mt-1 font-bold ${
                          stat.trend === "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.6 + index * 0.1 }}
                      >
                        <motion.div
                          animate={{
                            y: stat.trend === "up" ? [0, -2, 0] : [0, 2, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 2 + index * 0.2,
                          }}
                        >
                          <TrendingUp
                            className={`h-4 w-4 mr-1 ${
                              stat.trend === "down" ? "rotate-180" : ""
                            }`}
                          />
                        </motion.div>
                        {stat.change}
                      </motion.p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.3,
                delayChildren: 1.8,
              },
            },
          }}
          initial="hidden"
          animate="visible"
        >
          {/* Heat Map */}
          <motion.div
            className="lg:col-span-2"
            variants={{
              hidden: { opacity: 0, x: -30 },
              visible: {
                opacity: 1,
                x: 0,
                transition: {
                  duration: 0.6,
                  ease: "easeOut",
                },
              },
            }}
          >
            <Card>
              <motion.div
                className="flex items-center justify-between w-full"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.5 }}
              >
                <div className="flex items-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: 3,
                    }}
                  >
                    <Map className="h-5 w-5 text-primary mr-2" />
                  </motion.div>
                  <h2 className="text-xl font-semibold text-text">
                    Complaints Heatmap
                  </h2>
                </div>
                <motion.div
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2.2, duration: 0.5 }}
                >
                  <div className="text-sm text-text-light">
                    Showing {heatmapData.length} complaints
                  </div>
                  <div className="flex space-x-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={!showMarkers ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setShowMarkers(false)}
                        className="flex-1"
                      >
                        <Layers className="h-4 w-4 mr-1" />
                        Heat
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={showMarkers ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setShowMarkers(true)}
                        className="flex-1"
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Pins
                      </Button>
                    </motion.div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchComplaintsData}
                      disabled={loading}
                      className="flex items-center"
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          loading ? "animate-spin" : ""
                        }`}
                      />
                      Refresh
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Legend - moved above map */}
              <div className="mt-4 mb-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-text mb-4">
                  Map Legend
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm text-text">High Priority</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-text">Medium Priority</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-text">Low Priority</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-text">All Locations</span>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-text-light">Loading heatmap data...</p>
                  </div>
                </div>
              ) : heatmapData.length > 0 ? (
                <HeatMap
                  data={heatmapData}
                  showMarkers={showMarkers}
                  heatOptions={{
                    radius: 25,
                    blur: 15,
                  }}
                />
              ) : (
                <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-text-light text-lg mb-2">
                      No complaints found
                    </p>
                    <p className="text-text-light text-sm">
                      Try adjusting your filters
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Hotspots Sidebar */}
          <motion.div
            className="lg:col-span-1"
            variants={{
              hidden: { opacity: 0, x: 30 },
              visible: {
                opacity: 1,
                x: 0,
                transition: {
                  duration: 0.6,
                  ease: "easeOut",
                },
              },
            }}
          >
            <Card>
              <motion.h3
                className="text-lg font-semibold text-text mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5, duration: 0.5 }}
              >
                Top Complaint Hotspots
              </motion.h3>
              <motion.div
                className="space-y-4"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 2.7,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
              >
                {hotspots.map((hotspot, index) => (
                  <motion.div
                    key={index}
                    className="p-4 bg-background-light rounded-lg"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.4,
                          ease: "easeOut",
                        },
                      },
                    }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                      transition: { duration: 0.2 },
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <motion.h4
                        className="font-medium text-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.8 + index * 0.1 }}
                      >
                        {hotspot.area}
                      </motion.h4>
                      <motion.span
                        className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                          hotspot.severity
                        )}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 2.9 + index * 0.1,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        {hotspot.severity.toUpperCase()}
                      </motion.span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-text-light">
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 3 + index * 0.1 }}
                      >
                        {hotspot.category}
                      </motion.span>
                      <motion.span
                        className="font-medium"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 3.1 + index * 0.1 }}
                      >
                        {hotspot.complaints} complaints
                      </motion.span>
                    </div>
                    <motion.div
                      className="mt-2 bg-gray-200 rounded-full h-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 3.2 + index * 0.1 }}
                    >
                      <motion.div
                        className={`h-2 rounded-full ${
                          hotspot.severity === "high"
                            ? "bg-red-500"
                            : hotspot.severity === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          delay: 3.3 + index * 0.1,
                          duration: 0.8,
                          ease: "easeOut",
                        }}
                        style={{
                          transformOrigin: "left",
                          width: `${Math.min(
                            (hotspot.complaints / 200) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4, duration: 0.6 }}
        >
          <Card className="mt-8">
            <motion.h3
              className="text-lg font-semibold text-text mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4.2, duration: 0.5 }}
            >
              Key Insights
            </motion.h3>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.2,
                    delayChildren: 4.4,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: {
                      duration: 0.5,
                      ease: "easeOut",
                    },
                  },
                }}
              >
                <motion.h4
                  className="font-medium text-text mb-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  Current Trends
                </motion.h4>
                <motion.ul
                  className="space-y-2 text-sm text-text-light"
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
                  {stats ? (
                    <>
                      <motion.li
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0 },
                        }}
                      >
                        • Total complaints in selected period: {stats.total}
                      </motion.li>
                      <motion.li
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0 },
                        }}
                      >
                        • Most common department:{" "}
                        {Object.keys(stats.byDepartment || {}).reduce(
                          (a, b) =>
                            stats.byDepartment[a] > stats.byDepartment[b]
                              ? a
                              : b,
                          "N/A"
                        )}
                      </motion.li>
                      <motion.li
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0 },
                        }}
                      >
                        • High priority cases: {stats.byPriority?.High || 0}
                      </motion.li>
                    </>
                  ) : (
                    <>
                      <motion.li
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0 },
                        }}
                      >
                        • Loading trend analysis...
                      </motion.li>
                      <motion.li
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0 },
                        }}
                      >
                        • Analyzing complaint patterns...
                      </motion.li>
                      <motion.li
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0 },
                        }}
                      >
                        • Calculating priority distributions...
                      </motion.li>
                    </>
                  )}
                </motion.ul>
              </motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: 20 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: {
                      duration: 0.5,
                      ease: "easeOut",
                    },
                  },
                }}
              >
                <motion.h4
                  className="font-medium text-text mb-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  Recommendations
                </motion.h4>
                <motion.ul
                  className="space-y-2 text-sm text-text-light"
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
                  <motion.li
                    variants={{
                      hidden: { opacity: 0, x: 10 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    • Focus resources on high-density complaint areas
                  </motion.li>
                  <motion.li
                    variants={{
                      hidden: { opacity: 0, x: 10 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    • Implement preventive measures in recurring hotspots
                  </motion.li>
                  <motion.li
                    variants={{
                      hidden: { opacity: 0, x: 10 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    • Increase monitoring frequency for high-priority zones
                  </motion.li>
                </motion.ul>
              </motion.div>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Heatmaps;
