<script lang="ts" setup>
import { ref } from "vue";
import SquadPerformanceTable from "~/components/dashboard/SquadPerformanceTable.vue";
import KpiCard from "~/components/dashboard/KpiCard.vue";
import BurnUpChart from "~/components/chart/BurnupChart.vue";

// State untuk form filter, kita kosongkan nilai awalnya
const filterForm = ref({
  startDate: "",
  endDate: "",
});

// State untuk menandai apakah filter sudah pernah dijalankan
const hasFiltered = ref(false);
const isLoading = ref(false);
const error = ref<any>(null);
let controller: AbortController | null = null;

const kpiData = ref({
  totalUsers: 0,
  totalSquads: 0,
  totalSubtasksCreated: 0,
  totalHours: 0.0,
});

const squadPerformanceData = ref([]);
const burnupChartData = ref([]);

async function fetchData() {
  // Batalkan request sebelumnya jika ada yang sedang berjalan
  controller?.abort();
  // Buat controller baru untuk request kali ini
  controller = new AbortController();

  isLoading.value = true;
  error.value = null;

  try {
    // Siapkan semua promise untuk dijalankan secara paralel
    const kpiPromise = $fetch("/api/dashboard/kpis", {
      query: filterForm.value,
      signal: controller.signal, // <-- Lewatkan signal
    });

    const squadPromise = $fetch("/api/dashboard/squad-performance", {
      query: filterForm.value,
      signal: controller.signal, // <-- Lewatkan signal
    });

    const burnupPromise = $fetch("/api/dashboard/burnup-chart", {
      query: filterForm.value,
      signal: controller.signal, // <-- Lewatkan signal
    });

    // Jalankan semua request secara bersamaan dan tunggu semuanya selesai
    const [kpiResult, squadResult, burnupResult] = await Promise.all([
      kpiPromise,
      squadPromise,
      burnupPromise,
    ]);

    // Update state dengan data baru jika berhasil
    kpiData.value = kpiResult;
    squadPerformanceData.value = squadResult;
    burnupChartData.value = burnupResult;
  } catch (err: any) {
    // Jika error BUKAN karena kita sengaja membatalkannya, maka catat error
    if (err.name !== "AbortError") {
      error.value = err;
      console.error("Terjadi kesalahan saat filter:", err);
    }
  } finally {
    isLoading.value = false;
  }
}

// Fungsi untuk memicu kedua fetch saat tombol ditekan
function handleFilterSubmit() {
  if (!filterForm.value.startDate || !filterForm.value.endDate) {
    alert("Silakan isi Tanggal Mulai dan Tanggal Selesai.");
    return;
  }
  hasFiltered.value = true;
  fetchData(); // Panggil fungsi fetch utama kita
}

onUnmounted(() => {
  controller?.abort();
});
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold mb-0">Dashboard</h2>
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <form
          @submit.prevent="handleFilterSubmit"
          class="row g-3 align-items-end"
        >
          <div class="col-md">
            <label for="startDate" class="form-label small"
              >Tanggal Mulai</label
            >
            <input
              id="startDate"
              v-model="filterForm.startDate"
              type="date"
              class="form-control"
              required
            />
          </div>
          <div class="col-md">
            <label for="endDate" class="form-label small"
              >Tanggal Selesai</label
            >
            <input
              id="endDate"
              v-model="filterForm.endDate"
              type="date"
              class="form-control"
              required
            />
          </div>
          <div class="col-md-auto">
            <button
              type="submit"
              class="btn btn-primary w-100"
              :disabled="isLoading"
            >
              <span
                v-if="isLoading"
                class="spinner-border spinner-border-sm me-1"
              ></span>
              {{ isLoading ? "Memuat..." : "Terapkan" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <KpiCard :kpis="kpiData" :loading="isLoading" />

    <div class="mt-4">
      <BurnUpChart :chart-data="burnupChartData" :loading="isLoading" />
    </div>

    <div class="mt-4">
      <SquadPerformanceTable
        :squads="squadPerformanceData"
        :loading="isLoading"
      />
    </div>
  </div>
</template>
