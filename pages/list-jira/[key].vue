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
        <h4>Main Issue: **{{ jiraKey }}**</h4>
        <div v-if="loadingMainIssue" class="text-center py-4">
          <p>Loading main issue details...</p>
        </div>
        <div
          v-else-if="mainIssueErrorMessage"
          class="alert alert-danger"
          role="alert"
        >
          <p>Error loading main issue: {{ mainIssueErrorMessage }}</p>
          <p>Could not retrieve details for Jira key: **{{ jiraKey }}**.</p>
        </div>
        <div v-else-if="mainJiraIssue" class="jira-details-card mb-4">
          <h5>{{ displayMainSummary }}</h5>
          <p><strong>Key:</strong> {{ mainJiraIssue.key }}</p>
          <p><strong>Status:</strong> {{ displayMainStatus }}</p>
          <p><strong>Assignee:</strong> {{ displayMainAssignee }}</p>
          <p><strong>Created:</strong> {{ displayCreated }}</p>

          <h6 class="mt-3">Description:</h6>
          <div
            v-if="mainJiraIssue.fields.description"
            class="description-content"
          >
            <pre>{{ displayMainDescription }}</pre>
          </div>
          <div v-else class="text-muted">
            <p>No description available for this main issue.</p>
          </div>
        </div>
        <div v-else class="text-center py-4">
          <p>No main issue details found for Jira key: **{{ jiraKey }}**.</p>
          <p class="text-muted">
            It might not exist or the API returned no data.
          </p>
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
.jira-details-card {
  border: 1px solid #dee2e6;
  padding: 1.5rem;
  border-radius: 0.375rem;
  background-color: #f8f9fa;
  margin-bottom: 1.5rem;
}

.description-content {
  white-space: pre-wrap;
  background-color: #e9ecef;
  padding: 1rem;
  border-radius: 0.25rem;
  font-family: monospace;
  word-break: break-word;
}
</style>
