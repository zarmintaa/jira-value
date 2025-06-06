<script setup lang="ts">
// ID Isu yang ingin diambil
import { useSafeFetch } from "~/composable/useSafeFetch";
import type { JiraIssue } from "~/types/jira";

const issueId = "ITBOA-13693";

// Kita tidak perlu mendefinisikan semua field, cukup yang kita gunakan saja.

const {
  data: issue,
  pending,
  error,
} = await useSafeFetch<JiraIssue>(`/api/jira/${issueId}`);

console.log("Data mentah dari Jira:", issue.value);
</script>

<template>
  <div>
    <h1>Detail Tiket Jira</h1>

    <div v-if="pending">
      <p>Memuat data...</p>
    </div>

    <div v-else-if="error">
      <p class="text-red-500 font-bold">Maaf, terjadi kesalahan.</p>
      <p class="text-gray-600">
        {{ error.message || "Tidak bisa memuat detail tiket." }}
      </p>
    </div>

    <div v-else-if="issue && issue.fields">
      <h2>{{ issue.fields.summary }}</h2>
      <p>
        Status: <strong>{{ issue.fields.status.name }}</strong>
      </p>
      <p>
        Assignee:
        <strong>{{
          issue.fields.assignee?.displayName || "Unassigned"
        }}</strong>
      </p>
    </div>

    <div v-else>
      <p>Data tiket tidak ditemukan atau format tidak sesuai.</p>
    </div>
  </div>
</template>
