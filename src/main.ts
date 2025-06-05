import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import { routes } from "@/routes";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { api, apiClient } from "@/utils/api.ts";

const app = createApp(App);
const pinia = createPinia();

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
);

app.use(pinia);
app.use(routes);

app.config.globalProperties.$api = api;
app.config.globalProperties.$apiClient = apiClient;

// Hapus global error handlers dari sini - biarkan App.vue yang handle
// Atau bisa juga sebaliknya, hapus dari App.vue dan pakai yang ini

app.provide("api", api);
app.provide("apiClient", apiClient);
app.mount("#app");
