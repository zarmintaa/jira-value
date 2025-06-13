<script lang="ts" setup>
import { gsap } from "gsap";

// PERUBAHAN: Tambahkan props baru untuk tombol
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

// PERUBAHAN: Tambahkan 'confirm' ke dalam emits
const emit = defineEmits(["close", "confirm"]);

// ... (Fungsi onEnter dan onLeave tidak perlu diubah) ...
function onEnter(element: Element, done: () => void) {
  const el = element as HTMLElement;
  const overlay = el;
  const dialog = el.querySelector(".modal-dialog");
  gsap.to(overlay, { backgroundColor: "rgba(0, 0, 0, 0.5)", duration: 0.3 });
  gsap.fromTo(
    dialog,
    { opacity: 0, scale: 0.9, y: -30 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.4,
      ease: "power3.out",
      onComplete: done,
    },
  );
}

function onLeave(element: Element, done: () => void) {
  const el = element as HTMLElement;
  const overlay = el;
  const dialog = el.querySelector(".modal-dialog");
  gsap.to(overlay, { backgroundColor: "rgba(0, 0, 0, 0)", duration: 0.3 });
  gsap.to(dialog, {
    opacity: 0,
    scale: 0.95,
    y: -20,
    duration: 0.3,
    ease: "power2.in",
    onComplete: done,
  });
}
</script>

<template>
  <Teleport to="body">
    <Transition :css="false" @enter="onEnter" @leave="onLeave">
      <div v-if="show" class="modal-overlay" @click="emit('close')">
        <div
          class="modal-dialog shadow-lg"
          @click.stop
          role="dialog"
          aria-modal="true"
        >
          <div v-if="$slots.header" class="modal-header">
            <slot name="header" />
            <button @click="emit('close')" class="btn-close" aria-label="Close">
              &times;
            </button>
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
    </Transition>
  </Teleport>
</template>

<style scoped>
/* PERUBAHAN GAYA:
  - .modal-overlay sekarang menggunakan flexbox untuk menengahkan dialog.
  - .modal-dialog tidak lagi butuh position relative.
*/
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0); /* Awalnya transparan total */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-dialog {
  background: white;
  border-radius: 0.5rem;
  min-width: 400px;
  max-width: 90vw;
  opacity: 0; /* Awalnya transparan, dianimasikan GSAP */
}

/* Sisa styling (header, body, footer) tidak berubah */
.modal-header,
.modal-body,
.modal-footer {
  /* ... sama seperti sebelumnya ... */
  padding: 1.5rem;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  border-top: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
}
.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: #6c757d;
  cursor: pointer;
}
</style>
