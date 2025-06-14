<script lang="ts" setup>
// Komponen ini menerima dua props: 'kpis' untuk datanya, dan 'loading' untuk state loading.
defineProps<{
  kpis: {
    totalUsers: number;
    totalSquads: number;
    totalSubtasksCreated: number;
    totalHours: number;
  } | null;
  loading: boolean;
}>();
</script>

<template>
  <div class="row g-3">
    <div class="col-xl-4 col-md-6">
      <div class="card shadow-sm border-0 h-100">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="p-3 bg-info bg-opacity-10 text-info rounded-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              fill="currentColor"
              class="bi bi-clock-history"
              viewBox="0 0 16 16"
            >
              <path
                d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .586.023l8 4a.5.5 0 0 1 0 .868l-8 4a.5.5 0 0 1-.586-.434V8a7 7 0 0 0 0-14z"
              />
              <path
                d="M8 3.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z"
              />
            </svg>
          </div>
          <div>
            <p class="text-muted mb-1">Total Estimasi Jam</p>
            <div v-if="loading" class="placeholder-glow">
              <span class="placeholder rounded-1 col-6"></span>
            </div>
            <h3 v-else class="fw-bold mb-0">
              {{ kpis?.totalHours?.toFixed(1) ?? "0.0" }}h
            </h3>
          </div>
        </div>
      </div>
    </div>

    <div class="col-xl-4 col-md-6">
      <div class="card shadow-sm border-0 h-100">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="p-3 bg-primary bg-opacity-10 text-primary rounded-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              fill="currentColor"
              class="bi bi-stack"
              viewBox="0 0 16 16"
            >
              <path
                d="M4.118 7.643A.5.5 0 0 1 4.5 7.5h7a.5.5 0 0 1 .457.672l-3.5 6a.5.5 0 0 1-.914 0l-3.5-6a.5.5 0 0 1 .075-.529zM12 7.5L8.5 1h-1L4 7.5h8zm-1.144-1.5L8 2.386 5.144 6h5.712z"
              />
            </svg>
          </div>
          <div>
            <p class="text-muted mb-1">Total Subtask Dibuat</p>
            <div v-if="loading" class="placeholder-glow">
              <span class="placeholder rounded-1 col-6"></span>
            </div>
            <h3 v-else class="fw-bold mb-0">
              {{ kpis?.totalSubtasksCreated ?? 0 }}
            </h3>
          </div>
        </div>
      </div>
    </div>

    <div class="col-xl-4 col-md-6">
      <div class="card shadow-sm border-0 h-100">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="p-3 bg-success bg-opacity-10 text-success rounded-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              fill="currentColor"
              class="bi bi-people-fill"
              viewBox="0 0 16 16"
            >
              <path
                d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
              />
              <path
                fill-rule="evenodd"
                d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
              />
            </svg>
          </div>
          <div>
            <p class="text-muted mb-1">Total Member</p>
            <div v-if="loading" class="placeholder-glow">
              <span class="placeholder rounded-1 col-6"></span>
            </div>
            <h3 v-else class="fw-bold mb-0">{{ kpis?.totalUsers ?? 0 }}</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="col-xl-4 col-md-6">
      <div class="card shadow-sm border-0 h-100">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="p-3 bg-warning bg-opacity-10 text-warning rounded-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              fill="currentColor"
              class="bi bi-collection-fill"
              viewBox="0 0 16 16"
            >
              <path
                d="M0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7z"
              />
              <path
                d="M2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3zm2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1z"
              />
            </svg>
          </div>
          <div>
            <p class="text-muted mb-1">Total Squad</p>
            <div v-if="loading" class="placeholder-glow">
              <span class="placeholder rounded-1 col-6"></span>
            </div>
            <h3 v-else class="fw-bold mb-0">{{ kpis?.totalSquads ?? 0 }}</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
