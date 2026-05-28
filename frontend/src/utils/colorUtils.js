// Centralized color utility for consistent theming across the application

// Base color palette - using semantic color naming
export const colorPalette = {
  // Status colors for different states
  success: {
    light: "bg-green-100 text-green-800",
    default: "bg-green-500 text-white",
    dark: "bg-green-600 text-white",
    chart: "#059669", // For charts
  },
  warning: {
    light: "bg-yellow-100 text-yellow-800",
    default: "bg-yellow-500 text-white",
    dark: "bg-yellow-600 text-white",
    chart: "#D97706",
  },
  danger: {
    light: "bg-red-100 text-red-800",
    default: "bg-red-500 text-white",
    dark: "bg-red-600 text-white",
    chart: "#DC2626",
  },
  info: {
    light: "bg-blue-100 text-blue-800",
    default: "bg-blue-500 text-white",
    dark: "bg-blue-600 text-white",
    chart: "#3B82F6",
  },
  primary: {
    light: "bg-purple-100 text-purple-800",
    default: "bg-purple-500 text-white",
    dark: "bg-purple-600 text-white",
    chart: "#8B5CF6",
  },
  secondary: {
    light: "bg-gray-100 text-gray-800",
    default: "bg-gray-500 text-white",
    dark: "bg-gray-600 text-white",
    chart: "#6B7280",
  },
  orange: {
    light: "bg-orange-100 text-orange-800",
    default: "bg-orange-500 text-white",
    dark: "bg-orange-600 text-white",
    chart: "#F97316",
  },
};

// Priority level color mapping
export const getPriorityColor = (priority, variant = "light") => {
  const priorityMap = {
    emergency: colorPalette.danger[variant],
    high: colorPalette.orange[variant],
    medium: colorPalette.warning[variant],
    low: colorPalette.success[variant],
  };

  return (
    priorityMap[priority?.toLowerCase()] || colorPalette.secondary[variant]
  );
};

// Status color mapping for complaints
export const getComplaintStatusColor = (status, variant = "light") => {
  const statusMap = {
    pending: colorPalette.orange[variant],
    assigned: colorPalette.warning[variant],
    "in-progress": colorPalette.primary[variant],
    resolved: colorPalette.success[variant],
    closed: colorPalette.secondary[variant],
    rejected: colorPalette.danger[variant],
    // Legacy support for old status values
    completed: colorPalette.success[variant],
    denied: colorPalette.danger[variant],
  };

  return statusMap[status?.toLowerCase()] || colorPalette.secondary[variant];
};

// Status color mapping for workers
export const getWorkerStatusColor = (status, variant = "light") => {
  const statusMap = {
    available: colorPalette.success[variant],
    active: colorPalette.success[variant],
    busy: colorPalette.info[variant],
    "on-break": colorPalette.warning[variant],
    break: colorPalette.warning[variant],
    offline: colorPalette.secondary[variant],
  };

  return statusMap[status?.toLowerCase()] || colorPalette.secondary[variant];
};

// Department color mapping
export const getDepartmentColor = (department, variant = "light") => {
  const departmentMap = {
    road: colorPalette.info[variant],
    roads: colorPalette.info[variant],
    water: colorPalette.primary[variant],
    electricity: colorPalette.warning[variant],
    waste: colorPalette.success[variant],
    drainage: colorPalette.orange[variant],
    other: colorPalette.secondary[variant],
  };

  return (
    departmentMap[department?.toLowerCase()] || colorPalette.secondary[variant]
  );
};

// Chart color schemes for consistent visualization
export const chartColorSchemes = {
  priority: [
    colorPalette.danger.chart, // Emergency
    colorPalette.orange.chart, // High
    colorPalette.warning.chart, // Medium
    colorPalette.success.chart, // Low
  ],

  status: [
    colorPalette.orange.chart, // Pending
    colorPalette.warning.chart, // Assigned
    colorPalette.primary.chart, // In Progress
    colorPalette.success.chart, // Completed/Resolved
    colorPalette.danger.chart, // Denied
    colorPalette.secondary.chart, // Closed
  ],

  workerStatus: [
    colorPalette.success.chart, // Available/Active
    colorPalette.info.chart, // Busy
    colorPalette.warning.chart, // On Break
    colorPalette.secondary.chart, // Offline
  ],

  department: [
    colorPalette.info.chart, // Roads
    colorPalette.primary.chart, // Water
    colorPalette.warning.chart, // Electricity
    colorPalette.success.chart, // Waste
    colorPalette.orange.chart, // Drainage
    colorPalette.secondary.chart, // Other
  ],

  // Default professional colors for general charts
  default: [
    "#1D4ED8",
    "#059669",
    "#D97706",
    "#DC2626",
    "#8B5CF6",
    "#6B7280",
    "#F97316",
    "#EF4444",
  ],
};

// Utility function to get colors for charts based on data type
export const getChartColors = (type, dataLength = 5) => {
  const scheme = chartColorSchemes[type] || chartColorSchemes.default;

  // If we need more colors than available, cycle through the scheme
  if (dataLength > scheme.length) {
    const extendedColors = [];
    for (let i = 0; i < dataLength; i++) {
      extendedColors.push(scheme[i % scheme.length]);
    }
    return extendedColors;
  }

  return scheme.slice(0, dataLength);
};

// Export individual color functions for backward compatibility
export {
  getPriorityColor as getPriorityColors,
  getComplaintStatusColor as getStatusColors,
  getWorkerStatusColor as getWorkerColors,
  getDepartmentColor as getDepartmentColors,
};
