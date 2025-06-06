<template>
  <div
    v-if="visible"
    :class="`notification-${error.type}`"
    class="notification-item"
  >
    <div class="notification-header">
      <strong class="notification-title">
        <span v-if="error.type === 'api'" class="icon">⚠️</span>
        <span v-else-if="error.type === 'network'" class="icon">🌐</span>
        <span v-else-if="error.type === 'validation'" class="icon">❗</span>
        <span v-else class="icon">⚙️</span>
        {{ userFriendlyTitle }}
      </strong>
      <button
        aria-label="Close Notification"
        class="close-button"
        @click="dismiss"
      >
        &times;
      </button>
    </div>
    <p class="notification-message">{{ userFriendlyMessage }}</p>

    <div v-if="userActionableSuggestion" class="notification-suggestion">
      <small>Suggestion: {{ userActionableSuggestion }}</small>
    </div>

    <div v-if="error.details && showDetails" class="notification-details">
      <hr />
      <strong>Technical Details:</strong>
      <pre>{{ technicalDetails }}</pre>
    </div>

    <div class="notification-footer">
      <small>Error ID: {{ error.id }}</small>
      <button
        v-if="error.details && !showDetails"
        class="details-toggle-button"
        @click="toggleDetails"
      >
        Show Details
      </button>
      <button
        v-if="showDetails"
        class="details-toggle-button"
        @click="toggleDetails"
      >
        Hide Details
      </button>
    </div>

    <div class="progress-bar-container">
      <div :style="{ width: progress + '%' }" class="progress-bar"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { AppError } from "@/stores/error-store";
import { useErrorStore } from "@/stores/error-store";

const props = defineProps<{
  error: AppError;
  duration: number;
}>();

const errorStore = useErrorStore();
const visible = ref(true);
const progress = ref(100);
const showDetails = ref(false);
let intervalId: ReturnType<typeof setTimeout> | undefined;

const dismiss = () => {
  visible.value = false;
  errorStore.markAsRead(props.error.id);
};

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

const userFriendlyTitle = computed(() => {
  switch (props.error.type) {
    case "api":
      return "Server Communication Issue";
    case "network":
      return "Network Connection Problem";
    case "validation":
      return "Invalid Input";
    case "general":
    default:
      return props.error.title || "An Error Occurred";
  }
});

const userFriendlyMessage = computed(() => {
  switch (props.error.type) {
    case "api":
      if (props.error.statusCode === 401 || props.error.statusCode === 403) {
        return "You do not have permission to perform this action. Please try logging in again or contact an administrator.";
      }
      if (props.error.statusCode === 404) {
        return "The requested data was not found on the server.";
      }
      if (props.error.statusCode && props.error.statusCode >= 500) {
        return "We're experiencing some trouble on our server. Our team is looking into it. Please try again shortly.";
      }
      return (
        props.error.message ||
        "Failed to process your request due to a server issue."
      );
    case "network":
      return "Unable to connect to the server. Please ensure your internet connection is stable and try again.";
    case "validation":
      return (
        props.error.message ||
        "Please check the data you entered and try again."
      );
    case "general":
    default:
      return props.error.message === "An unknown error occurred"
        ? "An unexpected error occurred. Please try again."
        : props.error.message;
  }
});

const userActionableSuggestion = computed(() => {
  switch (props.error.type) {
    case "network":
      return "Check your internet connection.";
    case "validation":
      return "Correct the highlighted fields.";
    case "api":
      if (props.error.statusCode === 401 || props.error.statusCode === 403)
        return "Try logging in again.";
      if (props.error.statusCode && props.error.statusCode >= 500)
        return "Try again in a few minutes.";
      return "Try repeating your action. If the problem persists, please contact support.";
    default:
      return "Try refreshing the page or repeating your action.";
  }
});

const technicalDetails = computed(() => {
  if (!props.error.details) return "No technical details available.";
  try {
    if (props.error.details instanceof Error) {
      return `Name: ${props.error.details.name}\nMessage: ${props.error.details.message}\nStack: ${props.error.details.stack?.substring(0, 500) || "N/A"}`;
    }
    if (props.error.details.isAxiosError) {
      let detailsOutput = `Error Type: AxiosError\n`;
      if (props.error.details.message)
        detailsOutput += `Axios Message: ${props.error.details.message}\n`;
      if (props.error.details.config?.url)
        detailsOutput += `URL: ${props.error.details.config.url}\n`;
      if (props.error.details.config?.method)
        detailsOutput += `Method: ${props.error.details.config.method?.toUpperCase()}\n`;
      if (props.error.details.response) {
        detailsOutput += `Response Status: ${props.error.details.response.status}\n`;
        detailsOutput += `Response Data: ${JSON.stringify(props.error.details.response.data, null, 2)}\n`;
      } else if (props.error.details.request) {
        detailsOutput += `Request Error: No response received from server.\n`;
      }
      return detailsOutput;
    }
    return JSON.stringify(props.error.details, null, 2);
  } catch (e) {
    return "Failed to display technical details.";
  }
});

onMounted(() => {
  const startTime = Date.now();
  const totalDuration = props.duration;

  intervalId = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    const newProgress = Math.max(0, 100 - (elapsedTime / totalDuration) * 100);
    progress.value = newProgress;
    if (newProgress <= 0) {
      clearInterval(intervalId);
    }
  }, 100);
  console.log(
    `💡 NotificationItem mounted for error ID: ${props.error.id}, Title: "${props.error.title}"`,
  );
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
  console.log(
    `🧹 NotificationItem unmounted for error ID: ${props.error.id}, Title: "${props.error.title}"`,
  );
});
</script>

<style scoped>
.notification-item {
  background-color: #fff;
  color: #333;
  padding: 12px 15px;
  border-left-width: 5px;
  border-left-style: solid;
  border-top: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 0 5px 5px 0;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  width: 380px;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
  font-size: 14px;
  line-height: 1.4;
}

.notification-api {
  border-left-color: #dc3545;
}

.notification-network {
  border-left-color: #ffc107;
}

.notification-validation {
  border-left-color: #fd7e14;
}

.notification-general {
  border-left-color: #6c757d;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notification-title {
  font-size: 1.05em;
  font-weight: 600; /* */
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 8px;
  font-size: 1.2em;
}

.notification-message {
  margin: 0 0 8px 0;
}

.notification-suggestion {
  font-size: 0.9em;
  color: #555;
  margin-bottom: 8px;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.6em;
  font-weight: bold;
  color: #aaa;
  cursor: pointer;
  padding: 0 5px;
  line-height: 1;
}

.close-button:hover {
  color: #333;
}

.progress-bar-container {
  height: 4px;
  background-color: #e9ecef;
  border-radius: 2px;
  margin-top: auto;
}

.progress-bar {
  height: 100%;
  background-color: var(--bs-primary); /* */
  border-radius: 2px;
  transition: width 0.1s linear;
}

.notification-details {
  margin-top: 10px;
  font-size: 0.85em;
  max-height: 150px;
  overflow-y: auto;
  background-color: #f8f9fa; /* */
  padding: 8px;
  border-radius: 3px;
  border: 1px solid #e9ecef;
}

.notification-details pre {
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  font-size: 0.95em;
  color: #444;
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8em;
  color: #6c757d; /* */
  margin-top: 10px;
  margin-bottom: 8px;
}

.details-toggle-button {
  background: none;
  border: none;
  color: var(--bs-primary); /* */
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font-size: 0.95em;
}
</style>
