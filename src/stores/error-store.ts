// src/stores/error-store.ts
import { computed, reactive } from "vue";
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
    autoRemoveDelay: number = 10000, // Default 10 detik
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

    console.log(
      `🕒 Setting autoRemoveTimer for error ID: ${error.id}, Title: "${error.title}", Delay: ${autoRemoveDelay}ms`,
    );
    error.autoRemoveTimer = setTimeout(() => {
      console.log(
        `⏰ Auto removing error ID: ${error.id}, Title: "${error.title}" after ${autoRemoveDelay}ms`,
      );
      removeError(error.id);
    }, autoRemoveDelay);

    // Untuk debugging, lebih baik log salinan objek agar tidak terpengaruh perubahan selanjutnya
    console.log("🟢 Error added to store:", JSON.parse(JSON.stringify(error)));
    console.log("🟢 Current state.errors count:", state.errors.length);

    return error;
  };

  const removeError = (id: string): void => {
    const errorIndex = state.errors.findIndex((err) => err.id === id);

    if (errorIndex > -1) {
      const errorToRemove = state.errors[errorIndex];
      console.log(
        `🔴 removeError called for ID: ${id}, Title: "${errorToRemove.title}"`,
      );

      if (errorToRemove.autoRemoveTimer) {
        console.log(
          `   Clearing autoRemoveTimer: ${errorToRemove.autoRemoveTimer} for error ID: ${id}`,
        );
        clearTimeout(errorToRemove.autoRemoveTimer);
        delete errorToRemove.autoRemoveTimer;
      }

      state.errors.splice(errorIndex, 1);
      console.log(
        `   Error ID: ${id} removed from array. Errors left: ${state.errors.length}`,
      );

      if (state.currentError?.id === id) {
        state.currentError = state.errors[0] || null;
        console.log(
          `   Current error updated to: ${state.currentError ? `ID: ${state.currentError.id}, Title: "${state.currentError.title}"` : "null"}`,
        );
      }
    } else {
      console.warn(`🔴 removeError: Error ID ${id} not found in state.errors.`);
    }
  };

  const clearAllErrors = (): void => {
    console.log("🔥 Clearing all errors. Current count:", state.errors.length);
    state.errors.forEach((error) => {
      if (error.autoRemoveTimer) {
        console.log(`   Clearing timer for error ID: ${error.id}`);
        clearTimeout(error.autoRemoveTimer);
      }
    });
    state.errors = [];
    state.currentError = null;
    console.log("🔥 All errors cleared. Current count:", state.errors.length);
  };

  const markAsRead = (id: string): void => {
    console.log(`👁️ markAsRead called with ID: ${id}`);
    const error = state.errors.find((e) => e.id === id);
    if (error) {
      error.isRead = true;
      console.log(`👁️ Error ID: ${id} marked as read, Title: "${error.title}"`);
      setTimeout(() => {
        console.log(
          `👁️ Auto-removing marked-as-read error ID: ${id} after 300ms`,
        );
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

  // Computed properties untuk di-expose ke komponen
  const allErrors = computed(() => state.errors);
  const activeError = computed(() => state.currentError); // Ini adalah currentError yang sudah di-compute
  const isLoading = computed(() => state.isLoading);

  return {
    allErrors, // Gunakan ini untuk iterasi di UI menampilkan semua notifikasi
    currentError: activeError, // Tetap sediakan jika ada UI yang masih memakai 'currentError' tunggal
    isLoading,
    addError,
    removeError,
    clearAllErrors,
    markAsRead,
    getErrorsByType,
    getUnreadCount,
    setLoading,
  };
};

// Global error handler utility (tetap sama)
export const errorHandler = {
  async handle<T>(
    asyncFn: () => Promise<T>,
    errorMessage?: string,
  ): Promise<T | null> {
    const { addError, setLoading } = useErrorStore();
    setLoading(true);
    try {
      return await asyncFn();
    } catch (error) {
      // Memastikan error yang dilempar ke addError adalah objek yang sesuai atau string
      let processedError: Partial<AppError> | Error | AxiosError | string;
      if (errorMessage) {
        processedError = {
          message: errorMessage,
          details: error, // error asli tetap disimpan di details
          type: "general", // Default type
        };
      } else if (error instanceof Error) {
        processedError = error; // Biarkan addError memprosesnya
      } else if (typeof error === "string") {
        processedError = error;
      } else {
        // Fallback jika error adalah unknown
        processedError = {
          message: "An unexpected error occurred.",
          details: error,
          type: "general",
        };
      }
      addError(processedError);
      return null;
    } finally {
      setLoading(false);
    }
  },

  catch(error: unknown, customMessage?: string): void {
    const { addError } = useErrorStore();
    let processedError: Partial<AppError> | Error | AxiosError | string;
    if (customMessage) {
      processedError = {
        message: customMessage,
        details: error,
        type: "general",
      };
    } else if (error instanceof Error) {
      processedError = error;
    } else if (typeof error === "string") {
      processedError = error;
    } else {
      processedError = {
        message: "An unexpected error occurred from catch.",
        details: error,
        type: "general",
      };
    }
    addError(processedError);
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
