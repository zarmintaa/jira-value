// src/utils/api.ts
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";
import { useErrorStore } from "@/stores/error-store.ts";

// Konfigurasi base untuk API
const API_CONFIG = {
  baseURL: "https://adira-jira-100.atlassian.net/rest/api/3",
  timeout: 10000, // 10 detik
  headers: {
    "Content-Type": "application/json",
  },
};

// Token auth basic Anda
const AUTH_TOKEN =
  "di56YXJrYXNpaC5ha2htYWRAYWRpcmEuY28uaWQ6QVRBVFQzeEZmR0YwNVdvVWNEbkNydnhRRzR0cGd3c3dMVk9WRmV0b3R5dlpSSFVGUlhQM040S0Zsb1dfNHB4SnlNbXZMT2tWRU9OdFRweWhvQjJyU0JuNjNIMnhlUDJjQkRlNGdwYy1MOG5UOWpObE1NbUxMX3V4NXB2ZVhYWmxPTnV0bmkxVEM3NHJjcFVXWXZhM2dMamJCUHBWazNJQzJWQUx0RWp2YXBLRTBlcmdLODhpZUE4PTc1NzFGNjA4";

// Membuat instance axios
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Request interceptor untuk menambahkan auth header
apiClient.interceptors.request.use(
  (config) => {
    // Menambahkan Authorization header ke setiap request
    config.headers.Authorization = `Basic ${AUTH_TOKEN}`;

    // Log request untuk debugging (opsional)
    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
    );

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    // Tangkap error di request interceptor
    const { addError } = useErrorStore();
    addError(error);
    return Promise.reject(error);
  },
);

// Response interceptor untuk handle response dan error
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response untuk debugging (opsional)
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Handle error response dan masukkan ke error store
    console.error(
      "❌ Response Error:",
      error.response?.status,
      error.response?.data,
    );

    const { addError } = useErrorStore();
    addError(error);

    return Promise.reject(error);
  },
);

// API utility functions dengan error handling built-in
export const api = {
  // GET request
  get: async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    try {
      const response = await apiClient.get<T>(url, config);
      return response.data;
    } catch (error) {
      // Error sudah ditangkap di interceptor, tinggal throw lagi
      throw error;
    }
  },

  // POST request
  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    try {
      const response = await apiClient.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    try {
      const response = await apiClient.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    try {
      const response = await apiClient.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH request
  patch: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    try {
      const response = await apiClient.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Safe API calls - tidak akan throw error, mengembalikan null jika error
export const safeApi = {
  get: async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T | null> => {
    try {
      return await api.get<T>(url, config);
    } catch {
      return null;
    }
  },

  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T | null> => {
    try {
      return await api.post<T>(url, data, config);
    } catch {
      return null;
    }
  },

  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T | null> => {
    try {
      return await api.put<T>(url, data, config);
    } catch {
      return null;
    }
  },

  delete: async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T | null> => {
    try {
      return await api.delete<T>(url, config);
    } catch {
      return null;
    }
  },

  patch: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T | null> => {
    try {
      return await api.patch<T>(url, data, config);
    } catch {
      return null;
    }
  },
};

// Export axios instance jika butuh akses langsung
export { apiClient };

// Types untuk Jira API (contoh)
export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
    };
    assignee?: {
      displayName: string;
      emailAddress: string;
    };
  };
}
