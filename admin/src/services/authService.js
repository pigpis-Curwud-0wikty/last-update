import axios from "axios";

class AuthService {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor to add Authorization header to ALL axios requests
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh for ALL axios requests
    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        console.log("🔍 Interceptor caught error:", {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message
        });

        const originalRequest = error.config;

        // Check if error is due to invalid token (401)
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log("🔄 401 detected, attempting token refresh...");
          
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return axios(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Attempt to refresh token
            const newToken = await this.refreshToken();
            
            if (newToken) {
              console.log("✅ Token refresh successful, retrying original request");
              // Update token in localStorage
              localStorage.setItem("token", newToken);
              
              // Update Authorization header for the original request
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              
              // Process queued requests
              this.processQueue(null, newToken);
              
              // Retry the original request
              return axios(originalRequest);
            } else {
              console.log("❌ Token refresh failed, redirecting to login");
              // Refresh failed, redirect to login
              this.processQueue(new Error("Token refresh failed"), null);
              this.redirectToLogin();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            console.error("❌ Token refresh error:", refreshError);
            this.processQueue(refreshError, null);
            this.redirectToLogin();
            return Promise.reject(error);
          } finally {
            this.isRefreshing = false;
          }
        }

        // For non-401 errors, just reject
        return Promise.reject(error);
      }
    );
  }

  async refreshToken() {
    try {
      const currentToken = localStorage.getItem("token");
      if (!currentToken) {
        throw new Error("No token to refresh");
      }

      console.log("🔄 Attempting to refresh token...");

      // Make GET request to refresh token endpoint
      const response = await axios.get(
        "https://fashion-v1.runasp.net/api/Account/refresh-token",
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      console.log("🔄 Refresh response:", response.data);

      // Extract new token from response
      const newToken = 
        response?.data?.token ||
        response?.data?.accessToken ||
        response?.data?.data?.token ||
        response?.data?.data?.accessToken ||
        response?.data;

      if (newToken && typeof newToken === "string" && newToken.length > 10) {
        console.log("✅ Token refreshed successfully");
        return newToken;
      } else {
        console.error("❌ Invalid token response format:", response.data);
        throw new Error("Invalid token response format");
      }
    } catch (error) {
      console.error("❌ Token refresh failed:", error.message);
      throw error;
    }
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  redirectToLogin() {
    // Clear token from localStorage
    localStorage.removeItem("token");
    
    // Show notification
    if (window.showToast) {
      window.showToast("Session expired. Please login again.", "error");
    } else {
      alert("Session expired. Please login again.");
    }
    
    // Redirect to login page
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  }

  // Method to manually refresh token (can be called from components)
  async manualRefresh() {
    try {
      const newToken = await this.refreshToken();
      if (newToken) {
        localStorage.setItem("token", newToken);
        return newToken;
      }
      return null;
    } catch (error) {
      this.redirectToLogin();
      return null;
    }
  }

  // Method to check if token is valid
  async validateToken(token) {
    try {
      const response = await axios.get(
        "https://fashion-v1.runasp.net/api/Account/validate",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Method to get current token
  getCurrentToken() {
    return localStorage.getItem("token");
  }

  // Method to clear token and logout
  logout() {
    localStorage.removeItem("token");
    window.location.href = "/";
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
