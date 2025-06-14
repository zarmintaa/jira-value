<script lang="ts" setup>
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from 'chart.js';

// Daftarkan komponen-komponen Chart.js yang akan kita gunakan
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler);

// Tipe data untuk props
interface ChartData {
  date: string;
  scope: number;
  completed: number;
}

// Komponen ini menerima data dan status loading
const props = defineProps<{
  chartData: ChartData[];
  loading: boolean;
}>();

// Opsi konfigurasi untuk tampilan grafik
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Grafik Burn-up Progres Pekerjaan',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Jumlah Subtask'
      }
    }
  }
};

// Computed property untuk memformat data agar sesuai dengan Chart.js
const formattedChartData = computed(() => {
  const labels = props.chartData.map(d => d.date);
  const scopeData = props.chartData.map(d => d.scope);
  const completedData = props.chartData.map(d => d.completed);

  return {
    labels,
    datasets: [
      {
        label: 'Total Pekerjaan (Scope)',
        data: scopeData,
        borderColor: 'rgb(108, 117, 125)',
        backgroundColor: 'rgba(108, 117, 125, 0.1)',
        tension: 0.1,
        fill: true,
      },
      {
        label: 'Pekerjaan Selesai',
        data: completedData,
        borderColor: 'rgb(13, 110, 253)',
        backgroundColor: 'rgba(13, 110, 253, 0.2)',
        tension: 0.1,
        fill: true,
      },
    ],
  };
});
</script>

<template>
  <div class="card shadow-sm border-0">
    <div class="card-body">
      <div v-if="loading" style="height: 400px" class="d-flex align-items-center justify-content-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading Chart...</span>
        </div>
      </div>
      <div v-else style="height: 400px">
        <Line :data="formattedChartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>