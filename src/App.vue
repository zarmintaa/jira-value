<script setup lang="ts">
import ErrorNotification from "@/components/error/ErrorNotification.vue";
import { useErrorStore } from "@/stores/error-store.ts";
import { getErrorDetails, getErrorMessage } from "@/utils/error-helpers.ts";
import { onMounted, onUnmounted, getCurrentInstance } from "vue";

const { addError } = useErrorStore();

let unhandledRejectionHandler: (event: PromiseRejectionEvent) => void;
let errorHandler: (event: ErrorEvent) => void;
let vueErrorHandler: (error: unknown, instance: any, info: string) => void;

onMounted(() => {
  // Global promise rejection handler
  unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
    console.error("Unhandled promise rejection:", event.reason);

    const errorMessage = getErrorMessage(event.reason);

    addError({
      type: "general",
      title: "Unhandled Promise Error",
      message: errorMessage,
      details: getErrorDetails(event.reason),
    });

    event.preventDefault(); // Prevent console error
  };

  // Global JavaScript error handler
  errorHandler = (event: ErrorEvent) => {
    console.error("Global JavaScript error:", event.error);

    const errorMessage = getErrorMessage(event.error) || event.message;

    addError({
      type: "general",
      title: "JavaScript Error",
      message: errorMessage,
      details: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: getErrorDetails(event.error),
      },
    });
  };

  // Vue error handler
  vueErrorHandler = (error: unknown, _instance: any, info: string) => {
    console.error("Vue Error:", error, info);

    const errorMessage = getErrorMessage(error);
    const errorDetails = getErrorDetails(error);

    addError({
      type: "general",
      title: "Application Error",
      message: errorMessage,
      details: { error: errorDetails, info },
    });
  };

  // Register handlers
  window.addEventListener("unhandledrejection", unhandledRejectionHandler);
  window.addEventListener("error", errorHandler);

  // Set Vue error handler
  const app = getCurrentInstance()?.appContext.app;
  if (app) {
    app.config.errorHandler = vueErrorHandler;
  }
});

onUnmounted(() => {
  // Cleanup handlers
  if (unhandledRejectionHandler) {
    window.removeEventListener("unhandledrejection", unhandledRejectionHandler);
  }
  if (errorHandler) {
    window.removeEventListener("error", errorHandler);
  }
});
</script>

<template>
  <div id="app">
    <router-view />
    <ErrorNotification />
  </div>
</template>

<style scoped></style>
