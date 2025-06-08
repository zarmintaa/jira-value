<script lang="ts" setup>
import IconUser from "../icons/IconUser.vue"; // Asumsi path ini benar
</script>

<template>
  <section class="header bg-white px-5 position-relative">
    <div class="d-flex justify-content-end align-items-center py-lg-4">
      <div class="d-flex align-items-center gap-3">
        <div class="position-relative">
          <IconUser />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.notification-badge {
  font-size: 0.7rem;
}

.notification-dropdown {
  width: 350px; /* Lebar dropdown notifikasi */
  /* margin-right: 6rem; Anda mungkin perlu sesuaikan ini agar tidak tumpang tindih */
  z-index: 1020; /* Pastikan z-index konsisten */
  max-height: 350px;
  overflow-y: auto;
  margin-right: 6rem;
  right: 1rem; /* Sesuaikan posisi agar pas */
  top: 100%; /* Muncul di bawah header */
}

.user-custom-dropdown {
  width: 200px; /* Lebar dropdown user */
  z-index: 1020; /* Pastikan z-index konsisten, sama atau lebih tinggi dari notifikasi jika bisa tumpang tindih */
  right: 0; /* Menempel di kanan parent */
  top: 100%; /* Muncul di bawah ikon user */
  /* mt-2 sudah ada, p-3, bg-white, shadow, rounded sudah dari kelas Bootstrap */
}

.user-name-display {
  font-weight: 500;
  word-break: break-all; /* Jika nama pengguna terlalu panjang */
}

.notification-item {
  cursor: pointer;
  border-bottom: 1px solid #dee2e6;
  padding: 0.75rem 0.5rem; /* Sedikit padding lebih */
}

.notification-item:last-child {
  border-bottom: none; /* Hapus border untuk item terakhir */
}

.new-badge {
  font-size: 0.6rem;
}

.delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: 0.5rem;
  background: transparent;
  border: none;
  height: 24px;
  width: 24px;
  font-size: 1.2rem;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.2s;
}

.delete-button:hover:not(:disabled) {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.delete-button:focus {
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
  outline: none;
}

.btn:disabled {
  opacity: 0.65; /* Sedikit lebih terlihat saat disabled */
  cursor: not-allowed;
}

.btn-link.text-decoration-none {
  text-decoration: none !important;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Hapus transisi fade jika tidak digunakan secara eksplisit dengan <transition> */
/*
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
*/

/* Styling untuk modal sudah ada di ConfirmDeleteModal atau global,
   tapi jika perlu override, bisa di sini */
.modal {
  z-index: 1050; /* Pastikan modal di atas segalanya */
}

.modal-dialog {
  max-width: 400px;
  margin: 1.75rem auto;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}
</style>
