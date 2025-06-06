import { useErrorStore, type AppError } from "~/stores/error-store";

export default defineNuxtPlugin((nuxtApp) => {
  // Menangkap error dari sisi Vue (client-side)
  nuxtApp.vueApp.config.errorHandler = (error: any, instance, info) => {
    // Dapatkan instance store di dalam handler
    const errorStore = useErrorStore();

    console.error("Vue Error Caught:", error);

    // Kirim error ke Pinia Store untuk ditampilkan sebagai notifikasi
    errorStore.addError({
      type: "general",
      title: "An Application Error Occurred",
      message: error.message || "An unknown error happened inside a component.",
      details: {
        error,
        vm: instance,
        info,
      },
    });
  };

  // Menangkap unhandled promise rejections (sering terjadi dari async/await)
  if (process.client) {
    window.addEventListener("unhandledrejection", (event) => {
      const errorStore = useErrorStore();
      console.error("Unhandled Rejection:", event.reason);

      errorStore.addError({
        type: "general",
        title: "Unhandled Promise",
        message: event.reason?.message || "An unhandled promise was rejected.",
        details: event.reason,
      });
    });
  }
});
