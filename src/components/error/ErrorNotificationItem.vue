<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import type { AppError } from "@/stores/error-store";
import { useErrorStore } from "@/stores/error-store";

const props = defineProps<{
  error: AppError;
  duration: number; // durasi dalam ms, sama dengan autoRemoveDelay
}>();

const errorStore = useErrorStore();
const visible = ref(true);
const progress = ref(100);
let intervalId: number | undefined;
let timeoutId: ReturnType<typeof setTimeout> | undefined;

const dismiss = () => {
  visible.value = false;
  // Meskipun store akan menghapus, kita bisa memanggil markAsRead untuk UX yang lebih cepat
  // dan store akan menghandle penghapusan datanya.
  // Atau bisa juga errorStore.removeError(props.error.id) jika tidak butuh markAsRead
  errorStore.markAsRead(props.error.id);
};

onMounted(() => {
  const startTime = Date.now();
  const totalDuration = props.duration;

  intervalId = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    const newProgress = Math.max(0, 100 - (elapsedTime / totalDuration) * 100);
    progress.value = newProgress;
    if (newProgress <= 0) {
      clearInterval(intervalId);
      // visible.value = false; // Biarkan store yang menghapus datanya
    }
  }, 100); // Update progress setiap 100ms

  // Backup timeout jika interval tidak bersih (seharusnya tidak perlu jika store menghapus)
  // timeoutId = setTimeout(() => {
  //   visible.value = false;
  // }, totalDuration);

  // Log saat komponen ini di-mount dengan error spesifik
  console.log(
    `💡 NotificationItem mounted for error ID: ${props.error.id}, Title: "${props.error.title}"`,
  );
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
  if (timeoutId) clearTimeout(timeoutId);
  console.log(
    `🧹 NotificationItem unmounted for error ID: ${props.error.id}, Title: "${props.error.title}"`,
  );
});

// Jika error prop berubah (seharusnya tidak terjadi jika :key digunakan dengan benar di parent)
watch(
  () => props.error,
  (newError) => {
    console.warn(
      `⚠️ NotificationItem prop 'error' changed. New ID: ${newError.id}. This might indicate a missing :key in the parent v-for.`,
    );
    // Reset logic if needed, though :key should handle this by recreating the component.
    visible.value = true;
    progress.value = 100;
    // Re-setup interval and timeout
  },
);

// Untuk menampilkan detail error (opsional)
const details = computed(() => {
  if (props.error.details) {
    // Hindari menampilkan detail yang terlalu besar atau sirkular
    try {
      // Jika details adalah instance dari Error, ekstrak properti yang relevan
      if (props.error.details instanceof Error) {
        return {
          name: props.error.details.name,
          message: props.error.details.message,
          stack: props.error.details.stack?.substring(0, 500),
        };
      }
      // Jika AxiosError, ekstrak response data jika ada
      if (props.error.details.isAxiosError && props.error.details.response) {
        return {
          status: props.error.details.response.status,
          data: props.error.details.response.data,
          configUrl: props.error.details.config?.url,
        };
      }
      return props.error.details;
    } catch (e) {
      return "Could not stringify details.";
    }
  }
  return null;
});
</script>
<template>
  <div
    v-if="visible"
    :class="`notification-${error.type}`"
    class="notification-item"
  >
    <div class="notification-header">
      <strong>{{ error.title }}</strong>
      <button class="close-button" @click="dismiss">&times;</button>
    </div>
    <p>{{ error.message }}</p>
    <div v-if="details" class="notification-details">
      <pre>{{ JSON.stringify(details, null, 2) }}</pre>
    </div>
    <div class="progress-bar-container">
      <div :style="{ width: progress + '%' }" class="progress-bar"></div>
    </div>
  </div>
</template>

<style scoped>
.notification-item {
  background-color: #fff;
  color: #333;
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  width: 350px;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.notification-api {
  border-left: 5px solid #dc3545;
}

/* Merah untuk API error */
.notification-network {
  border-left: 5px solid #ffc107;
}

/* Kuning untuk Network error */
.notification-validation {
  border-left: 5px solid #fd7e14;
}

/* Oranye untuk Validation */
.notification-general {
  border-left: 5px solid #6c757d;
}

/* Abu-abu untuk General */

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.notification-header strong {
  font-size: 1.1em;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  padding: 0 5px;
}

.progress-bar-container {
  height: 5px;
  background-color: #e9ecef;
  border-radius: 0.25rem;
  margin-top: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #007bff; /* Warna progress bar, sesuaikan */
  transition: width 0.1s linear; /* Cocokkan dengan interval update progress */
}

.notification-details {
  margin-top: 10px;
  font-size: 0.9em;
  max-height: 100px;
  overflow-y: auto;
  background-color: #f8f9fa;
  padding: 5px;
  border-radius: 3px;
}

.notification-details pre {
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
</style>
