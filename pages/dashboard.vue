<script lang="ts" setup>
import { ref, onUnmounted } from "vue";
import SquadPerformanceTable from "~/components/dashboard/chart/SquadPerformanceTable.vue";
import KpiCard from "~/components/dashboard/chart/KpiCard.vue";
import BurnUpChart from "~/components/dashboard/chart/BurnupChart.vue";

// State untuk form filter
const filterForm = ref({
  startDate: "",
  endDate: "",
});

// State untuk menandai apakah filter sudah pernah dijalankan
const hasFiltered = ref(false);
let controller: AbortController | null = null;

// ====================================================================
// == PERUBAHAN UTAMA: State Loading & Data Terpisah untuk Setiap Widget ==
// ====================================================================

// 1. State untuk KPI Cards
const kpiLoading = ref(false);
const kpiData = ref({
  totalUsers: 0,
  totalSquads: 0,
  totalSubtasksCreated: 0,
  totalHours: 0.0,
});

// 2. State untuk Squad Performance Table
const squadLoading = ref(false);
const squadPerformanceData = ref([]);

// 3. State untuk Burn-up Chart
const burnUpLoading = ref(false);
const burnUpChartData = ref([]);

// ====================================================================

// Fungsi terpisah untuk fetch KPI
async function fetchKpis(signal: AbortSignal) {
  kpiLoading.value = true;
  try {
    const result = await $fetch("/api/dashboard/kpis", {
      query: filterForm.value,
      signal,
    });
    if (result) kpiData.value = result;
  } catch (err: any) {
    if (err.name !== "AbortError") console.error("Error fetching KPIs:", err);
  } finally {
    kpiLoading.value = false;
  }
}

// Fungsi terpisah untuk fetch Performa Squad
async function fetchSquadPerformance(signal: AbortSignal) {
  squadLoading.value = true;
  try {
    const result = await $fetch("/api/dashboard/squad-performance", {
      query: filterForm.value,
      signal,
    });
    if (result) squadPerformanceData.value = result;
  } catch (err: any) {
    if (err.name !== "AbortError")
      console.error("Error fetching Squad Performance:", err);
  } finally {
    squadLoading.value = false;
  }
}

// Fungsi terpisah untuk fetch data Burn-up Chart
async function fetchBurnupChart(signal: AbortSignal) {
  burnUpLoading.value = true;
  try {
    const result = await $fetch("/api/dashboard/burnup-chart", {
      query: filterForm.value,
      signal,
    });
    if (result) burnUpChartData.value = result;
  } catch (err: any) {
    if (err.name !== "AbortError")
      console.error("Error fetching Burnup Chart:", err);
  } finally {
    burnUpLoading.value = false;
  }
}

// Fungsi utama yang dipanggil oleh tombol "Terapkan"
function handleFilterSubmit() {
  if (!filterForm.value.startDate || !filterForm.value.endDate) {
    alert("Silakan isi Tanggal Mulai dan Tanggal Selesai.");
    return;
  }
  hasFiltered.value = true;

  // Batalkan semua request lama
  controller?.abort();
  // Buat controller baru untuk semua request baru
  controller = new AbortController();
  const signal = controller.signal;

  // Panggil ketiga fungsi fetch secara independen.
  // Kita tidak menggunakan `await` di sini agar ketiganya berjalan di latar belakang
  // tanpa menghalangi satu sama lain.
  fetchKpis(signal);
  fetchSquadPerformance(signal);
  fetchBurnupChart(signal);
}

const formLoading = computed(
  () => kpiLoading.value || squadLoading.value || burnUpLoading.value,
);

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
              :disabled="formLoading"
            >
              <span
                v-if="formLoading"
                class="spinner-border spinner-border-sm me-1"
              ></span>
              {{ formLoading ? "Memuat..." : "Terapkan" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <KpiCard :kpis="kpiData" :loading="kpiLoading" />

    <div class="mt-4">
      <BurnUpChart :chart-data="burnUpChartData" :loading="burnUpLoading" />
    </div>

    <div class="mt-4">
      <SquadPerformanceTable
        :squads="squadPerformanceData"
        :loading="squadLoading"
      />
    </div>
  </div>
</template>
