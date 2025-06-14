import { defineStore } from "pinia";

// Interface AppError tidak perlu diubah, sudah bagus.
export interface AppError {
  id: string;
  type: "general" | "api" | "network" | "validation";
  title: string; // Kita buat jadi wajib, karena akan diberi nilai default
  message: string;
  statusCode?: number;
  details?: any;
  timestamp: number;
}

export const useErrorStore = defineStore("error", {
  state: () => ({
    // Tipe data state tetap sama
    errors: [] as AppError[],
  }),

  getters: {
    // Getters tetap sama
    allErrors: (state) => state.errors,
    currentError: (state) => (state.errors.length > 0 ? state.errors[0] : null),
  },

  actions: {
    // ===================================================================
    // == PERUBAHAN UTAMA ADA DI FUNGSI addError INI ==
    // ===================================================================
    addError(rawError: any, customTitle?: string) {
      // Sekarang fungsi ini menerima error mentah dari `catch`

      const newError: AppError = {
        id: new Date().getTime().toString(),
        timestamp: Date.now(),
        // Siapkan nilai default
        title: customTitle || "Terjadi Kesalahan",
        message: "Sebuah kesalahan terjadi tanpa pesan detail.",
        type: "general",
        statusCode: 500,
        details: null,
      };

      // Cek jika ini adalah error dari $fetch Nuxt (memiliki `data` dan `statusCode`)
      if (rawError && rawError.data && rawError.statusCode) {
        newError.type = "api";
        newError.statusCode = rawError.statusCode;
        // Ambil pesan error yang paling relevan
        newError.message =
          rawError.data.statusMessage ||
          rawError.data.message ||
          "Error dari server.";
        newError.details = rawError.data; // Simpan seluruh data error untuk debug
      }
      // Cek jika ini adalah object Error JavaScript biasa
      else if (rawError instanceof Error) {
        newError.type = "general";
        newError.message = rawError.message;
        newError.details = rawError.stack; // Simpan stack trace
      }
      // Cek jika error yang dilempar hanya berupa string
      else if (typeof rawError === "string") {
        newError.message = rawError;
      }

      // Masukkan error baru ke paling atas array
      this.errors.unshift(newError);

      // Atur agar error hilang setelah 10 detik
      setTimeout(() => {
        this.removeError(newError.id);
      }, 10000);
    },

    // Ganti nama `markAsRead` menjadi lebih jelas
    removeError(id: string) {
      const index = this.errors.findIndex((e) => e.id === id);
      if (index > -1) {
        this.errors.splice(index, 1);
      }
    },

    // Ganti nama menjadi lebih konsisten
    clearErrors() {
      this.errors = [];
    },
  },
});
