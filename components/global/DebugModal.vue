<script lang="ts" setup>
// Komponen ini hanya menerima prop 'show' dan memancarkan 2 event
defineProps<{ show: boolean }>();
const emit = defineEmits(['close', 'confirm']);
</script>

<template>
  <div v-if="show" class="debug-modal-overlay">
    <div class="debug-modal-dialog">
      <h3>Ini adalah Modal Debug</h3>
      <p>Apakah event klik pada tombol di bawah ini berjalan?</p>
      <hr>
      <div class="debug-footer">
        <button @click="emit('close')">Tutup Modal</button>
        <button @click="emit('confirm')" class="btn-confirm">Jalankan Aksi</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Style minimalis hanya untuk memastikan komponen terlihat */
.debug-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(255, 0, 0, 0.1); /* Latar merah tipis agar terlihat jelas */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* z-index sangat tinggi */
}
.debug-modal-dialog {
  background: white;
  border: 3px solid red;
  padding: 2rem;
  text-align: center;
}
.debug-footer {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}
.btn-confirm {
  background-color: lightgreen;
}
</style>