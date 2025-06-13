<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { gsap } from "gsap";

// Komponen ini menerima props untuk kustomisasi
const props = withDefaults(
  defineProps<{
    message: string;
    type?: "success" | "error" | "info";
    duration?: number;
  }>(),
  {
    type: "info", // Default tipe notifikasi
    duration: 4000, // Default durasi tampil (4 detik)
  },
);

// Emit event 'close' saat notifikasi selesai
const emit = defineEmits(["close"]);

// Dapatkan referensi ke elemen DOM notifikasi
const notificationEl = ref<HTMLDivElement | null>(null);

// Fungsi untuk menutup notifikasi dengan animasi
function dismiss() {
  if (!notificationEl.value) return;

  // Animasi keluar (fade out dan geser ke atas)
  gsap.to(notificationEl.value, {
    opacity: 0,
    y: -20,
    duration: 0.3,
    ease: "power2.in",
    // Setelah animasi selesai, emit event 'close'
    onComplete: () => {
      emit("close");
    },
  });
}

// Jalankan animasi saat komponen pertama kali dimuat
onMounted(() => {
  if (!notificationEl.value) return;

  // Animasi masuk (muncul dari atas dan fade in)
  gsap.fromTo(
    notificationEl.value,
    { y: -100, opacity: 0 }, // dari posisi
    { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, // ke posisi
  );

  // Atur timer untuk menutup otomatis
  setTimeout(dismiss, props.duration);
});

// Tentukan kelas CSS berdasarkan tipe notifikasi
const alertClass = computed(() => {
  switch (props.type) {
    case "success":
      return "alert-success";
    case "error":
      return "alert-danger";
    default:
      return "alert-info";
  }
});
</script>

<template>
  <div ref="notificationEl" class="app-notification">
    <div class="alert shadow-lg" :class="alertClass" role="alert">
      <span>{{ message }}</span>
      <button @click="dismiss" class="btn-close" aria-label="Close"></button>
    </div>
  </div>
</template>

<style scoped>
.app-notification {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 1050; /* Pastikan di atas elemen lain */
  min-width: 300px;
}
.alert {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
/* Tombol close sederhana jika tidak menggunakan Bootstrap */
.btn-close {
  background: transparent;
  border: 0;
  opacity: 0.7;
  padding: 0.5rem;
}
.btn-close:hover {
  opacity: 1;
}
</style>
