<script lang="ts" setup>
import { useRoute } from "vue-router";
import type { JiraIssue, JiraSubtask } from "~/types/jira";
import { useSafeFetch } from "~/composable/useSafeFetch";
import { parseDDMONYYYY } from "~/utils/dateStringConverter";
import { isSameDay } from "date-fns";

const route = useRoute();
const jiraKey = route.params.key as string;

const subtaskDetails = ref<JiraIssue[]>([]);
const loadingSubtasks = ref(false);
let isComponentActive = true;

console.log(`Fetching details for main Jira key: ${jiraKey}`);

// --- 1. Fetching the SINGLE Main Jira Issue (which contains subtasks) ---
const {
  data: mainJiraIssue, // Holds the fetched main JiraIssue object
  pending: loadingMainIssue, // True while fetching the main issue
  error: mainIssueError, // Error for fetching the main issue
} = await useSafeFetch<JiraIssue>(`/api/jira/${jiraKey}`, {
  lazy: true,
  key: `issue-${jiraKey}`, // Menambahkan key untuk caching
});

// Fungsi untuk fetch semua subtask secara SERIAL (satu per satu)
const fetchAllSubtaskDetails = async () => {
  const allSubtasks: JiraSubtask[] = mainJiraIssue.value?.fields.subtasks || [];
  if (allSubtasks.length === 0) {
    console.log("Tidak ada subtask untuk di-fetch.");
    return;
  }

  console.log(
    `Memulai fetch untuk ${allSubtasks.length} subtask secara serial...`,
  );
  loadingSubtasks.value = true;
  subtaskDetails.value = [];

  try {
    for (const subtask of allSubtasks) {
      // cek apakah komponen aktif
      if (!isComponentActive) {
        console.log("Loop dihentikan karena komponen tidak lagi aktif.");
        return;
      }
      const { data: subtaskData } = await useFetch<JiraIssue>(
        `/api/jira/${subtask.key}`,
        { key: `subtask-${subtask.key}` },
      );
      if (subtaskData.value) {
        subtaskDetails.value.push(subtaskData.value);
      }
    }
    console.log(
      "Semua detail subtask berhasil di-fetch:",
      subtaskDetails.value,
    );
  } catch (error) {
    console.error("Gagal saat mem-fetch detail subtask:", error);
  } finally {
    loadingSubtasks.value = false;
  }
};

// Computed properties for the main Jira issue details display
const displaySummary = computed(
  () => mainJiraIssue.value?.fields.summary || "",
);

const displayMainStatus = computed(
  () => mainJiraIssue.value?.fields.status.name || "Unknown Status",
);
const displayMainAssignee = computed(
  () => mainJiraIssue.value?.fields.assignee?.displayName || "Unassigned",
);

const mainIssueErrorMessage = computed(
  () => mainIssueError.value?.message || null,
);
const displayCreated = computed(
  () => mainJiraIssue.value?.fields.created || null,
);

const displayTimeEstimate = computed(
  () => mainJiraIssue.value?.fields?.timeestimate || null,
);

const displayDateTask = computed(() =>
  getDateFromSummary(displaySummary.value),
);

const displayPointRate = computed(() => {
  if (subtaskDetails.value.length !== 0) {
    return null;
  }

  const dateSummary = getDateFromSummary(
    mainJiraIssue.value?.fields?.summary || "",
  );
  const dateCreated = mainJiraIssue.value?.fields?.created;

  console.log({ dateSummary, dateCreated });

  if (dateSummary && dateCreated) {
    const jiraOnTime = isSameDay(parseDDMONYYYY(dateSummary), dateCreated);

    const jiraDayPoint = 16;
    let totalPoint = 0;

    if (jiraOnTime) {
      if (displayCreated)
        totalPoint +=
          jiraDayPoint /
          formatDuration(mainJiraIssue.value?.fields?.timeestimate || 0);
    } else {
      totalPoint += 1;
    }

    if (totalPoint > 2) {
      totalPoint = 2;
    }

    return totalPoint;
  }
  return null;
});

const getDateFromSummary = (summary: string) => {
  const regex = /\d{2}[A-Z]{3}\d{4}/i;
  const match = summary.match(regex);
  return match ? match[0] : null;
};

// Gunakan 'watch' untuk memicu fetch subtask setelah fetch utama selesai
watch(
  mainJiraIssue,
  (newIssue) => {
    if (
      newIssue &&
      subtaskDetails.value.length === 0 &&
      !loadingSubtasks.value
    ) {
      fetchAllSubtaskDetails();
    }
  },
  {
    immediate: true,
  },
);

const allTimeEstimate = computed(() => {
  // Gunakan .reduce() untuk menjumlahkan estimasi dari semua detail subtask
  // `|| 0` memastikan jika timeestimate null/undefined, kita akan menambahkannya dengan 0
  return subtaskDetails.value.reduce((total, subtask) => {
    return total + (subtask.fields?.timeestimate || 0);
  }, 0); // 0 adalah nilai awal total
});

const allTotalSubtaskDetail = computed(() => subtaskDetails.value.length);

const countSubtasks = computed(
  () => mainJiraIssue.value?.fields?.subtasks.length || 0,
);

function formatDuration(seconds: number | null): number {
  if (seconds == null || seconds === 0) {
    return 0;
  }

  // Menangani durasi lebih dari 24 jam dengan benar
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  let result = 0;
  if (hours > 0) {
    result += hours;
  }
  if (minutes > 0) {
    result += minutes;
  }

  return result;
}

// --- Helper function for status badges ---
const getStatusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "to do":
      return "bg-secondary";
    case "in progress":
      return "bg-primary text-light"; // Changed to text-light for better contrast
    case "done":
    case "closed":
      return "bg-success";
    case "open":
      return "bg-info";
    case "reopened":
      return "bg-warning text-dark"; // Changed to text-dark
    default:
      return "bg-dark";
  }
};

// --- 2. Preparing data for the Subtasks TableView ---
const subtasksForTable = computed(() => {
  // Hanya proses jika mainJiraIssue.value ada dan subtasks-nya ada
  if (!mainJiraIssue.value || !mainJiraIssue.value.fields.subtasks) {
    return []; // Jika belum ada data atau subtasks tidak ada, kembalikan array kosong
  }
  return mainJiraIssue.value.fields.subtasks.map((subtask: JiraSubtask) => ({
    key: subtask.key,
    summary: subtask.fields.summary,
    status: subtask.fields.status.name,
    priority: subtask.fields.priority.name,
  }));
});

const subtaskRawKeys = computed(() => {
  if (!subtasksForTable.value || subtasksForTable.value.length === 0) {
    // Jika tidak ada subtask, kita masih bisa mengembalikan kunci default
    // agar header tabel tetap muncul saat loading/kosong.
    // Sesuaikan ini dengan kolom default yang Anda inginkan untuk subtask.
    return ["key", "summary", "status", "priority"];
  }
  const keys = Object.keys(subtasksForTable.value[0] || {});
  const excludedKeys = [""];
  return keys.filter((key) => !excludedKeys.includes(key));
});

const subtaskHeaders = computed(() =>
  subtaskRawKeys.value.map((key) =>
    key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  ),
);

const router = useNuxtApp().$router;
const navigateToJiraDetail = (row: any) => {
  router.push(`/list-jira/${row.key}`);
};

onUnmounted(() => {
  console.log("Komponen di-unmount, proses fetch akan dihentikan.");
  isComponentActive = false;
});
</script>

<template>
  <div class="card border-0 shadow-sm">
    <div
      class="card-header bg-white py-4 d-flex align-items-center justify-content-between"
    >
      <h3 class="mb-0">{{ jiraKey }} | {{ displaySummary }}</h3>
    </div>

    <div class="card-body">
      <div v-if="loadingMainIssue" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading main issue details...</p>
      </div>
      <div
        v-else-if="mainIssueErrorMessage"
        class="alert alert-danger p-4"
        role="alert"
      >
        <h5 class="alert-heading">Error Loading Issue!</h5>
        <p>{{ mainIssueErrorMessage }}</p>
        <hr />
        <p class="mb-0">
          Could not retrieve details for Jira key:
          <strong class="text-danger">{{ jiraKey }}</strong
          >. Please check the key or your connection.
        </p>
      </div>
      <div v-else-if="mainJiraIssue" class="mb-4">
        <div class="row g-3 mb-4">
          <div class="col-md-6 col-lg-4">
            <div class="detail-item p-3 border rounded bg-light">
              <p class="mb-1 text-muted">Assignee:</p>
              <p class="fw-bold mb-0 text-break">
                {{ displayMainAssignee }}
              </p>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="detail-item p-3 border rounded bg-light">
              <p class="mb-1 text-muted">Key:</p>
              <p class="fw-bold mb-0 text-break">
                {{ mainJiraIssue.key }}
              </p>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="detail-item p-3 border rounded bg-light">
              <p class="mb-1 text-muted">Status:</p>
              <span
                :class="['badge', getStatusBadgeClass(displayMainStatus)]"
                >{{ displayMainStatus }}</span
              >
            </div>
          </div>

          <div class="col-md-6 col-lg-4">
            <div class="detail-item p-3 border rounded bg-light">
              <p class="mb-1 text-muted">Created:</p>
              <p class="fw-bold mb-0">
                {{
                  displayCreated
                    ? new Date(displayCreated).toLocaleString()
                    : "N/A"
                }}
              </p>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="detail-item p-3 border rounded bg-light">
              <p class="mb-1 text-muted">Time Estimate:</p>

              <p
                v-if="displayTimeEstimate && !allTimeEstimate"
                class="fw-bold mb-0"
              >
                {{ formatDuration(displayTimeEstimate) }}H
              </p>

              <p v-else-if="loadingSubtasks" class="fw-bold mb-0 text-muted">
                Calculating {{ allTotalSubtaskDetail }} from
                {{ countSubtasks }} subtasks...
              </p>

              <p v-else class="fw-bold mb-0">
                {{ formatDuration(allTimeEstimate) }}H | Subtasks Total :
                {{ allTotalSubtaskDetail }}
              </p>
            </div>
          </div>

          <div class="col-md-6 col-lg-4" v-if="displayPointRate">
            <div class="detail-item p-3 border rounded bg-light">
              <p class="mb-1 text-muted">Jira Point Rate:</p>
              <span>{{ displayPointRate }}</span>
            </div>
          </div>
          <div class="col-md-6 col-lg-4" v-if="displayDateTask">
            <div class="detail-item p-3 border rounded bg-light">
              <p class="mb-1 text-muted">Sub Task Date:</p>
              <span>{{
                new Date(parseDDMONYYYY(displayDateTask)).toLocaleString()
              }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-5">
        <p class="lead">
          <i class="bi bi-info-circle text-info me-2"></i>No main issue details
          found for Jira key: <strong class="text-info">{{ jiraKey }}</strong
          >.
        </p>
        <p class="text-muted mt-2">
          It might not exist, or the API returned no data.
        </p>
        <button class="btn btn-outline-primary mt-3" @click="router.go(-1)">
          Go Back
        </button>
      </div>

      <hr class="my-4" />
      <h4 class="mb-3">Subtasks</h4>

      <TableView
        :error="mainIssueErrorMessage"
        :items="subtasksForTable"
        :itemsPerPage="10"
        :loading="loadingMainIssue"
        :onRowClick="navigateToJiraDetail"
        :tHeader="subtaskHeaders"
        :tKey="subtaskRawKeys"
      >
        <template
          v-if="
            !loadingMainIssue &&
            !mainIssueErrorMessage &&
            subtasksForTable.length === 0
          "
          #no-items
        >
          <div class="text-muted text-center py-3">
            <p>No subtasks found for this Jira issue.</p>
          </div>
        </template>
      </TableView>
    </div>
  </div>
</template>
<style scoped>
.detail-item {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.detail-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.description-content {
  white-space: pre-wrap;
  background-color: #f0f4f7; /* Lighter background for description */
  padding: 1.25rem;
  border-radius: 0.5rem;
  font-family: "SF Mono", "Segoe UI Mono", monospace; /* Modern monospace font */
  word-break: break-word;
  line-height: 1.6;
  color: #343a40;
}

.badge {
  font-size: 0.9em;
  padding: 0.5em 0.8em;
  border-radius: 0.375rem;
}

/* Custom styles for loading and error states */
.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3em;
}

.alert-danger {
  border-left: 5px solid #dc3545;
}

.text-primary {
  color: #007bff !important; /* Ensure primary color is consistent */
}
</style>
