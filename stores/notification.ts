// /stores/notification.ts (GAYA BARU: SETUP STORE)

import { ref, computed } from "vue";
import { defineStore } from "pinia";

// Definisikan tipe notifikasi untuk kejelasan
export type NotificationType = "success" | "error" | "info";

// Gunakan defineStore dengan "setup function" (mirip <script setup>)
export const useNotificationStore = defineStore("notification", () => {
  // 1. State sekarang didefinisikan sebagai `ref`
  const show = ref(false);
  const message = ref("");
  const type = ref<NotificationType>("success");
  const timeoutId = ref<NodeJS.Timeout | null>(null);

  // 2. Actions sekarang adalah fungsi biasa di dalam scope ini
  function showNotification(
    newMessage: string,
    newType: NotificationType = "success",
    duration: number = 4000
  ) {
    // Hapus timeout lama jika ada notifikasi yang sedang berjalan
    if (timeoutId.value) {
      clearTimeout(timeoutId.value);
    }

    // Set state baru menggunakan .value
    message.value = newMessage;
    type.value = newType;
    show.value = true;

    // Atur timer baru untuk menyembunyikan notifikasi
    timeoutId.value = setTimeout(() => {
      hideNotification();
    }, duration);
  }

  function hideNotification() {
    show.value = false;
    // Tidak perlu reset timeoutId di sini, karena akan di-clear di pemanggilan show berikutnya
  }

  // 3. Kembalikan semua state dan action yang ingin diekspos
  return {
    show,
    message,
    type,
    showNotification,
    hideNotification,
  };
});
