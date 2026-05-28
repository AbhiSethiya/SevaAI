// API utility functions for making backend requests

const API_BASE_URL = "/api";

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Complaint API functions
export const complaintAPI = {
  // Get all complaints with optional filters
  getAllComplaints: async (filters = {}) => {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== "all") {
        queryParams.append(key, filters[key]);
      }
    });

    const endpoint = `/complaints/all${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    console.log("Making API call to:", endpoint);
    const response = await apiRequest(endpoint);
    console.log("Raw API response:", response);
    return response;
  },

  // Get user's own complaints
  getMyComplaints: async (filters = {}) => {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== "all") {
        queryParams.append(key, filters[key]);
      }
    });

    const endpoint = `/complaints/my${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    console.log("Making API call to:", endpoint);
    const response = await apiRequest(endpoint);
    console.log("Raw API response:", response);
    return response;
  },

  // Get complaint by ticket ID
  getComplaintByTicket: async (ticketId) => {
    return apiRequest(`/complaints/ticket/${ticketId}`);
  },

  // Submit new complaint
  submitComplaint: async (complaintData) => {
    const formData = new FormData();

    // Add text fields
    Object.keys(complaintData).forEach((key) => {
      if (key !== "files" && complaintData[key] !== undefined) {
        if (key === "coordinates") {
          formData.append(key, JSON.stringify(complaintData[key]));
        } else {
          formData.append(key, complaintData[key]);
        }
      }
    });

    // Add files if present
    if (complaintData.files && complaintData.files.length > 0) {
      complaintData.files.forEach((file) => {
        formData.append("files", file);
      });
    }

    return apiRequest("/complaints/submit", {
      method: "POST",
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  },

  // Process raw complaint (AI-powered)
  processRawComplaint: async (rawText, lat, lng, confirmed = false) => {
    return apiRequest("/complaints/process", {
      method: "POST",
      body: JSON.stringify({ rawText, lat, lng, confirmed }),
    });
  },

  // Update complaint
  updateComplaint: async (complaintId, complaintData) => {
    console.log("Complaint API: Updating complaint", {
      complaintId,
      complaintData,
    });
    return apiRequest(`/complaints/${complaintId}`, {
      method: "PUT",
      body: JSON.stringify(complaintData),
    });
  },
};

// User/Worker API functions
export const userAPI = {
  // Get all users/workers
  getAllUsers: async (filters = {}) => {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== "all") {
        queryParams.append(key, filters[key]);
      }
    });

    const endpoint = `/users${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiRequest(endpoint);
  },

  // Get user profile
  getProfile: async () => {
    return apiRequest("/auth/me");
  },

  // Create new user/worker
  createUser: async (userData) => {
    return apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Update user
  updateUser: async (userId, userData) => {
    return apiRequest(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  // Delete user
  deleteUser: async (userId) => {
    return apiRequest(`/users/${userId}`, {
      method: "DELETE",
    });
  },
};

// HOD/Admin API functions
export const hodAPI = {
  // Get complaints by department
  getComplaintsByDepartment: async (department) => {
    return apiRequest(`/hod/complaints/${department}`);
  },

  // Assign worker to complaint
  assignWorker: async (complaintId, workerId) => {
    return apiRequest("/hod/assign", {
      method: "POST",
      body: JSON.stringify({ complaintId, workerId }),
    });
  },

  // Update complaint status
  updateComplaintStatus: async (complaintId, status, note = "") => {
    console.log("HOD API: Updating complaint status", {
      complaintId,
      status,
      note,
    });
    return apiRequest("/hod/update-status", {
      method: "POST",
      body: JSON.stringify({ complaintId, status, note }),
    });
  },
};

// Dashboard API functions
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async (timeframe = "30days", department = "all") => {
    const queryParams = new URLSearchParams();
    if (timeframe !== "30days") queryParams.append("timeframe", timeframe);
    if (department !== "all") queryParams.append("department", department);

    const endpoint = `/dashboard/stats${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiRequest(endpoint);
  },

  // Get recent complaints
  getRecentComplaints: async (limit = 5, department = "all") => {
    const queryParams = new URLSearchParams();
    if (limit !== 5) queryParams.append("limit", limit.toString());
    if (department !== "all") queryParams.append("department", department);

    const endpoint = `/dashboard/recent-complaints${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiRequest(endpoint);
  },

  // Get worker performance
  getWorkerStats: async (department = "all", available = false) => {
    const queryParams = new URLSearchParams();
    if (department !== "all") queryParams.append("department", department);
    if (available) queryParams.append("available", "true");

    const endpoint = `/dashboard/workers${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiRequest(endpoint);
  },

  // Get detailed worker information
  getWorkers: async (filters = {}) => {
    const queryParams = new URLSearchParams();

    // Add includeStats for workers
    queryParams.append("includeStats", "true");
    queryParams.append("role", "worker");

    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== "all") {
        queryParams.append(key, filters[key]);
      }
    });

    const endpoint = `/users${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiRequest(endpoint);
  },
};

// Worker Management API functions
export const workerAPI = {
  // Create new worker (Admin only)
  createWorker: async (workerData) => {
    return apiRequest("/workers/create", {
      method: "POST",
      body: JSON.stringify(workerData),
    });
  },

  // Update worker information (Admin only)
  updateWorker: async (workerId, workerData) => {
    return apiRequest(`/workers/${workerId}`, {
      method: "PUT",
      body: JSON.stringify(workerData),
    });
  },

  // Get all workers with metrics
  getAllWorkers: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== "all") {
        queryParams.append(key, filters[key]);
      }
    });

    const endpoint = `/workers${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiRequest(endpoint);
  },

  // Get available workers for a department
  getAvailableWorkers: async (department) => {
    return apiRequest(`/workers/available/${department}`);
  },

  // Assign complaint to worker
  assignComplaint: async (complaintId, workerId, estimatedTime) => {
    return apiRequest("/workers/assign-complaint", {
      method: "POST",
      body: JSON.stringify({ complaintId, workerId, estimatedTime }),
    });
  },

  // Update worker status
  updateWorkerStatus: async (workerId, statusData) => {
    return apiRequest(`/workers/status/${workerId}`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    });
  },

  // Get worker dashboard data
  getWorkerDashboard: async () => {
    return apiRequest("/workers/dashboard");
  },

  // Update complaint status (worker)
  updateComplaintStatus: async (complaintId, statusData) => {
    return apiRequest(`/workers/complaint/${complaintId}/status`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    });
  },
};

// Department constants
export const DEPARTMENTS = [
  { value: "all", label: "All Departments" },
  { value: "road", label: "Roads & Transportation" },
  { value: "water", label: "Water Supply" },
  { value: "electricity", label: "Electricity" },
  { value: "waste", label: "Waste Management" },
  { value: "drainage", label: "Drainage & Sewerage" },
  { value: "other", label: "Other" },
];

// Status constants
export const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "assigned", label: "Assigned" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
  { value: "rejected", label: "Rejected" },
];

// Priority constants
export const PRIORITY_OPTIONS = [
  { value: "all", label: "All Priorities" },
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

export default {
  complaintAPI,
  userAPI,
  hodAPI,
  dashboardAPI,
  workerAPI,
  DEPARTMENTS,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
};
