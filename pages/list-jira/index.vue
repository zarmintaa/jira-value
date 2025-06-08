<script setup lang="ts">
import { dummyJiraUser } from "~/data/dummy-jira";
import { ref } from "vue";
import type { Ref, UnwrapRef } from "vue";
import type { JiraUser } from "~/types/jira";
import TableView from "~/components/table/TableView.vue";

const data: Ref<UnwrapRef<JiraUser>[]> = ref(dummyJiraUser);
const loading = ref(false);
const error = ref<Error | null>(null);
const router = useNuxtApp().$router;

const allJira = computed(() => {
  const mappedData = data.value.map((issue) => ({
    assignee: issue.fields.assignee?.displayName,
    key: issue.key,
    summary: issue.fields.summary,
    status: issue.fields.status.name,
    email: issue.fields.assignee?.emailAddress,
    description: issue.fields.description,
    created: issue.fields.created,
  }));
  console.log("allJira data:", mappedData); // Tambahkan ini
  return mappedData;
});

const rawKeys = computed(() => {
  if (!allJira.value) return [];

  if (allJira.value.length === 0) {
    return [];
  }

  const keys = Object.keys(allJira.value[0] || {});

  const excludedKeys = [""];

  return keys.filter((key) => !excludedKeys.includes(key));
});

const headers = computed(() =>
  rawKeys.value.map((key) =>
    key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  ),
);

const errorMessage = computed(() => error.value?.message || null);

const navigateToJiraDetail = (row: any) => {
  router.push(`/list-jira/${row.key}`);
};
</script>

<template>
  <div class="card border-0 shadow-sm">
    <div
      class="card-header bg-white py-4 d-flex align-items-center justify-content-between"
    >
      <h3 class="fw-semibold mb-0">List Jira</h3>
    </div>

    <div class="card-body">
      <TableView
        :error="errorMessage"
        :items="allJira"
        :itemsPerPage="10"
        :onRowClick="navigateToJiraDetail"
        :loading="loading"
        :tHeader="headers"
        :tKey="rawKeys"
      />
    </div>
  </div>
</template>

<style scoped></style>
