<script lang="ts" setup>
// Tambahkan console.log ini untuk memastikan script baru yang berjalan
console.log("SCRIPT AppModal VERSI DEBUGGING (BORDER HIJAU) TELAH DIMUAT");

const props = withDefaults(
  defineProps<{
    show: boolean;
    confirmText?: string;
    cancelText?: string;
    confirmButtonType?: "primary" | "danger" | "secondary";
  }>(),
  {
    confirmText: "Confirm",
    cancelText: "Cancel",
    confirmButtonType: "primary",
  },
);

const emit = defineEmits(["close", "confirm"]);
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay-debug" @click="emit('close')">
      <div class="modal-dialog-debug" @click.stop>
        <div class="modal-header">
          <slot name="header" />
          <button @click="emit('close')" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div class="modal-footer">
          <button class="btn btn-light" @click="emit('close')">
            {{ cancelText }}
          </button>
          <button
            class="btn"
            :class="`btn-${confirmButtonType}`"
            @click="emit('confirm')"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Style minimalis untuk memastikan tidak ada konflik */
.modal-overlay-debug {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-dialog-debug {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  min-width: 400px;
}
.modal-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

/* TANDA VISUAL YANG SANGAT JELAS */
</style>
