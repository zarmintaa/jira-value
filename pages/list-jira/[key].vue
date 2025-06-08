<script setup lang="ts">
import { useRoute } from "vue-router";
import type { JiraIssue, JiraSubtask } from "~/types/jira";
import { useSafeFetch } from "~/composable/useSafeFetch";

const route = useRoute();
const jiraKey = route.params.key as string;

console.log(`Fetching details for main Jira key: ${jiraKey}`);

// --- 1. Fetching the SINGLE Main Jira Issue (which contains subtasks) ---
const {
  data: mainJiraIssue, // Holds the fetched main JiraIssue object
  pending: loadingMainIssue, // True while fetching the main issue
  error: mainIssueError, // Error for fetching the main issue
} = await useSafeFetch<JiraIssue>(`/api/jira/${jiraKey}`, {
  lazy: true,
});

// Computed properties for the main Jira issue details display
const displayMainSummary = computed(
  () => mainJiraIssue.value?.fields.summary || "Loading Summary...",
);
const displayMainStatus = computed(
  () => mainJiraIssue.value?.fields.status.name || "Unknown Status",
);
const displayMainAssignee = computed(
  () => mainJiraIssue.value?.fields.assignee?.displayName || "Unassigned",
);
const displayMainDescription = computed(
  () => mainJiraIssue.value?.fields.description || "No description available.",
);
const mainIssueErrorMessage = computed(
  () => mainIssueError.value?.message || null,
);
const displayCreated = computed(
  () => mainJiraIssue.value?.fields.created || null,
);
const displayIssueType = computed(
  () => mainJiraIssue.value?.fields?.issuetype?.name || null,
);

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
</script>

<template>
  <Layout>
    <BreadCrumb />

    <div class="card border-0 shadow-sm">
      <div
        class="card-header bg-white py-4 d-flex align-items-center justify-content-between"
      >
        <h3 class="fw-semibold mb-0">Jira Issue Details: {{ jiraKey }}</h3>
      </div>

      <div class="card-body">
        <h4 class="mb-4 text-primary">Main Issue: **{{ jiraKey }}**</h4>
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
          </div>

          <h6 class="mt-4 mb-2 text-primary border-bottom pb-2">
            Description:
          </h6>
          <div
            v-if="mainJiraIssue.fields.description"
            class="description-content shadow-sm"
          >
            <pre>{{ displayMainDescription }}</pre>
          </div>
          <div v-else class="text-muted fst-italic p-3 bg-light rounded">
            <p class="mb-0">No description available for this main issue.</p>
          </div>
        </div>
        <div v-else class="text-center py-5">
          <p class="lead">
            <i class="bi bi-info-circle text-info me-2"></i>No main issue
            details found for Jira key:
            <strong class="text-info">{{ jiraKey }}</strong
            >.
          </p>
          <p class="text-muted mt-2">
            It might not exist, or the API returned no data.
          </p>
          <button @click="router.go(-1)" class="btn btn-outline-primary mt-3">
            Go Back
          </button>
        </div>

        <hr class="my-4" />
        <h4 class="mb-3">Subtasks</h4>

        <TableView
          :error="mainIssueErrorMessage"
          :items="subtasksForTable"
          :itemsPerPage="10"
          :onRowClick="navigateToJiraDetail"
          :loading="loadingMainIssue"
          :tHeader="subtaskHeaders"
          :tKey="subtaskRawKeys"
        >
          <template
            #no-items
            v-if="
              !loadingMainIssue &&
              !mainIssueErrorMessage &&
              subtasksForTable.length === 0
            "
          >
            <div class="text-muted text-center py-3">
              <p>No subtasks found for this Jira issue.</p>
            </div>
          </template>
        </TableView>
      </div>
    </div>
  </Layout>
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
  font-family:
    "SF Mono", "Segoe UI Mono", monospace; /* Modern monospace font */
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
