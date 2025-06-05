<script lang="ts" setup>
import { useErrorStore } from "@/stores/error-store";
import FriendlyNotificationItem from "@/components/error/FriendlyNotificationItem.vue"; // Sesuaikan path jika perlu

const errorStore = useErrorStore();
</script>
<template>
  <div class="error-notification-list-container">
    <transition-group name="list" tag="div">
      <FriendlyNotificationItem
        v-for="error in errorStore.allErrors.value"
        :key="error.id"
        :duration="10000"
        :error="error"
      />
    </transition-group>
  </div>
</template>

<style scoped>
.error-notification-list-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000; /* Pastikan di atas elemen lain */
  display: flex;
  flex-direction: column;
  gap: 10px; /* Jarak antar notifikasi */
}

/* Transisi untuk list */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
