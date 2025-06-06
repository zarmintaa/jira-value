import { defineStore } from "pinia";

export interface AppError {
  id: string;
  type: "general" | "api" | "network" | "validation";
  title?: string;
  message: string;
  statusCode?: number;
  details?: any;
  timestamp: number;
}

export const useErrorStore = defineStore("error", {
  state: () => ({
    errors: [] as AppError[],
  }),

  getters: {
    allErrors: (state) => state.errors,
    currentError: (state) => (state.errors.length > 0 ? state.errors[0] : null),
  },

  actions: {
    addError(errorData: Omit<AppError, "id" | "timestamp">) {
      // Definisikan nilai default secara eksplisit
      const defaults = {
        title: "An Error Occurred",
      };

      const newError: AppError = {
        ...defaults,
        ...errorData, // Properti `title` dari errorData akan menimpa default jika ada
        id: new Date().getTime().toString(),
        timestamp: Date.now(),
      };

      this.errors.unshift(newError);

      setTimeout(() => {
        this.markAsRead(newError.id);
      }, 10000);
    },

    markAsRead(id: string) {
      const index = this.errors.findIndex((e) => e.id === id);
      if (index > -1) {
        this.errors.splice(index, 1);
      }
    },

    clearAllErrors() {
      this.errors = [];
    },
  },
});
