// src/stores/error-store.ts
import { reactive, computed } from "vue";
import type { AxiosError } from "axios";

export interface AppError {
  id: string;
  type: "api" | "validation" | "network" | "general";
  title: string;
  message: string;
  details?: any;
  timestamp: Date;
  statusCode?: number;
  isRead: boolean;
  autoRemoveTimer?: ReturnType<typeof setTimeout>; // Track timer untuk bisa di-cancel
}

export interface ErrorState {
  errors: AppError[];
  currentError: AppError | null;
  isLoading: boolean;
}

const state = reactive<ErrorState>({
  errors: [],
  currentError: null,
  isLoading: false,
});

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const parseAxiosError = (error: AxiosError): Partial<AppError> => {
  const response = error.response;
  const request = error.request;

  if (response) {
    const responseData = response.data as any;
    return {
      type: "api",
      title: `HTTP ${response.status} Error`,
      message:
        responseData?.message || response.statusText || "Server error occurred",
      statusCode: response.status,
      details: response.data,
    };
  } else if (request) {
    return {
      type: "network",
      title: "Network Error",
      message:
        "Unable to connect to server. Please check your internet connection.",
      details: error.message,
    };
  } else {
    return {
      type: "general",
      title: "Request Error",
      message: error.message || "An unexpected error occurred",
      details: error,
    };
  }
};

export const useErrorStore = () => {
  const addError = (
    errorInput: Partial<AppError> | Error | AxiosError | string,
    autoRemoveDelay: number = 10000, // Default 10 detik, konsisten dengan progress bar
  ): AppError => {
    console.log("🔵 addError called with:", errorInput);

    let errorData: Partial<AppError>;

    if (typeof errorInput === "string") {
      errorData = {
        type: "general",
        title: "Error",
        message: errorInput,
      };
    } else if (errorInput instanceof Error) {
      if ("isAxiosError" in errorInput && errorInput.isAxiosError) {
        errorData = parseAxiosError(errorInput as AxiosError);
      } else {
        errorData = {
          type: "general",
          title: errorInput.name || "Error",
          message: errorInput.message,
          details: errorInput,
        };
      }
    } else {
      errorData = errorInput as Partial<AppError>;
    }

    const error: AppError = {
      id: generateId(),
      type: errorData.type || "general",
      title: errorData.title || "Error",
      message: errorData.message || "An error occurred",
      details: errorData.details,
      timestamp: new Date(),
      statusCode: errorData.statusCode,
      isRead: false,
    };

    state.errors.unshift(error);
    state.currentError = error;

    // Set auto-removal timer
    error.autoRemoveTimer = setTimeout(() => {
      console.log("⏰ Auto removing error:", error.id);
      removeError(error.id);
    }, autoRemoveDelay);

    console.log("🟢 Error added to store:", error);
    console.log("🟢 Current state:", {
      errorsCount: state.errors.length,
      currentError: state.currentError,
    });

    return error;
  };

  const removeError = (id: string): void => {
    console.log("🔴 removeError called with ID:", id);

    const errorToRemove = state.errors.find((error) => error.id === id);

    // Clear auto-removal timer jika ada
    if (errorToRemove?.autoRemoveTimer) {
      clearTimeout(errorToRemove.autoRemoveTimer);
      delete errorToRemove.autoRemoveTimer;
    }

    const index = state.errors.findIndex((error) => error.id === id);
    if (index > -1) {
      state.errors.splice(index, 1);
      console.log("🔴 Error removed from array");
    }

    if (state.currentError?.id === id) {
      state.currentError = state.errors[0] || null;
      console.log("🔴 Current error updated:", state.currentError);
    }
  };

  const clearAllErrors = (): void => {
    // Clear semua timers sebelum clear errors
    state.errors.forEach((error) => {
      if (error.autoRemoveTimer) {
        clearTimeout(error.autoRemoveTimer);
      }
    });

    state.errors = [];
    state.currentError = null;
  };

  const markAsRead = (id: string): void => {
    console.log("👁️ markAsRead called with ID:", id);

    const error = state.errors.find((e) => e.id === id);
    if (error) {
      error.isRead = true;
      console.log("👁️ Error marked as read:", error);

      // Optional: Langsung remove setelah 300ms ketika di-mark as read
      setTimeout(() => {
        removeError(id);
      }, 300);
    }
  };

  const getErrorsByType = (type: AppError["type"]): AppError[] => {
    return state.errors.filter((error) => error.type === type);
  };

  const getUnreadCount = (): number => {
    return state.errors.filter((error) => !error.isRead).length;
  };

  const setLoading = (loading: boolean): void => {
    state.isLoading = loading;
  };

  // Simplified activeError - tidak perlu filter isRead karena sudah auto-remove
  const activeError = computed(() => {
    const result = state.currentError;
    console.log("🔍 activeError computed:", result);
    return result;
  });

  return {
    errors: state.errors,
    currentError: state.currentError,
    isLoading: state.isLoading,
    activeError,
    addError,
    removeError,
    clearAllErrors,
    markAsRead,
    getErrorsByType,
    getUnreadCount,
    setLoading,
  };
};

// Global error handler utility
export const errorHandler = {
  async handle<T>(
    asyncFn: () => Promise<T>,
    errorMessage?: string,
  ): Promise<T | null> {
    const { addError, setLoading } = useErrorStore();

    try {
      setLoading(true);
      return await asyncFn();
    } catch (error) {
      if (errorMessage) {
        addError({
          message: errorMessage,
          details: error,
          type: "general",
        });
      } else {
        addError(error as any);
      }
      return null;
    } finally {
      setLoading(false);
    }
  },

  catch(error: unknown, customMessage?: string): void {
    const { addError } = useErrorStore();

    if (customMessage) {
      addError({
        message: customMessage,
        details: error,
        type: "general",
      });
    } else {
      addError(error as any);
    }
  },

  validation(field: string, message: string): void {
    const { addError } = useErrorStore();
    addError({
      type: "validation",
      title: `Validation Error: ${field}`,
      message,
    });
  },
};

export const useError = () => {
  const store = useErrorStore();
  return {
    ...store,
    handler: errorHandler,
  };
};
