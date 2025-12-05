// Get API base URL from environment variable or use default
// In development, use proxy (empty string) or localhost
// In production, use the deployed backend URL
const getApiBaseUrl = () => {
  // Check for Vite environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // In development, use proxy (empty string means relative URL)
  if (import.meta.env.DEV) {
    return '/api/v1';
  }
  
  // Production fallback
  return "https://personalized-ai-gym.vercel.app/api/v1";
};

const API_BASE_URL = getApiBaseUrl();

// Helper function to handle fetch response errors
const handleResponseError = async (response) => {
  if (!response || !response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = {
        success: false,
        message: response 
          ? `Server error: ${response.status} ${response.statusText}`
          : 'Network error. Please check your connection and try again.'
      };
    }
    return errorData;
  }
  return null;
};

// Auth API functions
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      const error = await handleResponseError(response);
      if (error) return error;
      
      return response.json();
    } catch (err) {
      console.error("Register fetch error:", err);
      return {
        success: false,
        message: "Network error. Please check your connection and try again.",
        error: err.message
      };
    }
  },

  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      
      const error = await handleResponseError(response);
      if (error) return error;
      
      return response.json();
    } catch (err) {
      console.error("Login fetch error:", err);
      return {
        success: false,
        message: "Network error. Please check your connection and try again.",
        error: err.message
      };
    }
  },

  loginWithRole: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login-with-role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  getProfile: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  updateProfile: async (token, profileData) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    return response.json();
  },

  changePassword: async (token, passwordData) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });
    return response.json();
  },

  logout: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },
  regenerateFullPlan: async (token) => {
    const response = await fetch(`${API_BASE_URL}/user/regenerate-full-plan`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.json();
  },
};

// Public (unauthenticated) API functions
export const publicAPI = {
  getCoaches: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/coaches`);
    return response.json();
  },
};

// User API functions
export const userAPI = {
  getDashboard: async (token) => {
    const response = await fetch(`${API_BASE_URL}/user/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  completeOnboarding: async (token, onboardingData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(onboardingData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Onboarding API error:", {
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }

      return data;
    } catch (error) {
      console.error("Onboarding fetch error:", error);
      return {
        success: false,
        message: "Network error. Please check your connection and try again.",
        error: error.message,
      };
    }
  },

  getTodaysWorkout: async (token) => {
    const response = await fetch(`${API_BASE_URL}/user/schedule/today`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  completeWorkout: async (token, workoutId) => {
    const response = await fetch(
      `${API_BASE_URL}/user/workouts/${workoutId}/complete`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.json();
  },

  getWeeklySchedule: async (token, startDate) => {
    const url = startDate
      ? `${API_BASE_URL}/user/schedule/weekly?startDate=${startDate}`
      : `${API_BASE_URL}/user/schedule/weekly`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getNutritionPlan: async (token) => {
    const response = await fetch(`${API_BASE_URL}/user/nutrition/plan`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  updateProfile: async (token, profile) => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    });
    return response.json();
  },
};

// Admin API functions
export const adminAPI = {
  getDashboardStats: async (token) => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getAllUsers: async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.role) queryParams.append("role", params.role);
    if (params.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());

    const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getUserById: async (token, userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  updateUserProfile: async (token, userId, updateData) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/users/${userId}/profile`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      }
    );
    return response.json();
  },

  updateUserStatus: async (token, userId, isActive) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/users/${userId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      }
    );
    return response.json();
  },

  updateUserRole: async (token, userId, role) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });
    return response.json();
  },

  deleteUser: async (token, userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  assignCoachToClient: async (token, clientId, coachId) => {
    const response = await fetch(`${API_BASE_URL}/admin/coaches/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ clientId, coachId }),
    });
    return response.json();
  },

  removeCoachFromClient: async (token, clientId, coachId) => {
    const response = await fetch(`${API_BASE_URL}/admin/coaches/unassign`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ clientId, coachId }),
    });
    return response.json();
  },
};

// Coach API functions
export const coachAPI = {
  getDashboardStats: async (token) => {
    const response = await fetch(`${API_BASE_URL}/coach/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },
  getClients: async (token) => {
    const response = await fetch(`${API_BASE_URL}/coach/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
  getClientDetails: async (token, clientId) => {
    const response = await fetch(`${API_BASE_URL}/coach/clients/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};

// Utility functions
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

export const setAuthToken = (token) => {
  localStorage.setItem("authToken", token);
};

export const removeAuthToken = () => {
  localStorage.removeItem("authToken");
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};
