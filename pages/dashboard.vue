<script lang="ts" setup>
import { ref, computed } from "vue";
import dayjs from "dayjs";

// State HANYA untuk filter, tidak ada lagi kpiData atau watch
const selectedRange = ref("7d");
const controller = new AbortController();

// Computed untuk tanggal (tidak berubah)
const dateRange = computed(() => {
  const end = dayjs();
  let start;
  switch (selectedRange.value) {
    case "30d":
      start = dayjs().subtract(30, "day");
      break;
    case "this_month":
      start = dayjs().startOf("month");
      break;
    default:
      start = dayjs().subtract(7, "day");
  }
  return {
    startDate: start.format("YYYY-MM-DD"),
    endDate: end.format("YYYY-MM-DD"),
  };
});

// useAsyncData menjadi SATU-SATUNYA sumber kebenaran data kita
const { data, pending: isLoading } = useAsyncData(
  "kpi-data",
  () => $fetch("/api/dashboard/kpis", { query: dateRange.value }),
  {
    // Opsi ini akan otomatis memanggil ulang API saat filter berubah
    watch: [selectedRange],
    // 'default' memastikan variabel 'data' tidak pernah null dan memiliki struktur yang benar
    default: () => ({
      totalUsers: 0,
      totalSquads: 0,
      totalSubtasksCreated: 0,
    }),
  },
);

onUnmounted(() => {
  if (controller) {
    console.log("Membatalkan request KPI karena pindah halaman...");
    controller.abort();
  }
});
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold mb-0">Dashboard</h2>
      <div class="col-md-3 col-lg-2">
        <select
          v-model="selectedRange"
          class="form-select"
          :disabled="isLoading"
        >
          <option value="7d">7 Hari Terakhir</option>
          <option value="30d">30 Hari Terakhir</option>
          <option value="this_month">Bulan Ini</option>
        </select>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-lg-4 col-md-6">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="p-3 bg-primary bg-opacity-10 text-primary rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
              <div v-if="isLoading" class="placeholder-glow">
                <span class="placeholder col-6"></span>
              </div>
              <h3 v-else class="fw-bold mb-0">
                {{ data?.totalSubtasksCreated ?? 0 }}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4 col-md-6">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="p-3 bg-success bg-opacity-10 text-success rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
              <p class="text-muted mb-1">Total Pengguna</p>
              <div v-if="isLoading" class="placeholder-glow">
                <span class="placeholder col-6"></span>
              </div>
              <h3 v-else class="fw-bold mb-0">{{ data?.totalUsers ?? 0 }}</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4 col-md-6">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="p-3 bg-warning bg-opacity-10 text-warning rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
              <div v-if="isLoading" class="placeholder-glow">
                <span class="placeholder col-6"></span>
              </div>
              <h3 v-else class="fw-bold mb-0">{{ data?.totalSquads ?? 0 }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
