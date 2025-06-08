<script lang="ts" setup>
import { useSafeFetch } from "~/composable/useSafeFetch";
// Pastikan path ke types/jira benar
import type { JiraIssue } from "~/types/jira";

const issueId = "ITBOA-13693";

const {
  data: issue,
  pending,
  error,
} = await useSafeFetch<JiraIssue>(`/api/jira/${issueId}`, {
  lazy: true, // Tetap gunakan lazy: true untuk UX loading yang lebih cepat
});

// Anda bisa menambahkan logging di sisi client setelah hidrasi
// if (process.client && issue.value) {
//   console.log("Data Jira (client-side):", issue.value);
// }
</script>

<template>
  <div class="container">
    <h1>Detail Tiket Jira</h1>

    <div v-if="pending" class="loading-state">
      <p>Memuat data...</p>
      <div class="skeleton-container">
        <div class="skeleton-h2"></div>
        <div class="skeleton-p"></div>
        <div class="skeleton-p large"></div>
        <div class="skeleton-p small"></div>
      </div>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="text-red-500 font-bold">Maaf, terjadi kesalahan.</p>
      <p class="text-gray-600">
        {{ error.message || "Tidak bisa memuat detail tiket." }}
      </p>
      <p>Coba lagi nanti atau periksa koneksi Anda.</p>
    </div>

    <div v-else-if="issue && issue.fields">
      <div class="issue-details">
        <h2>{{ issue.fields.summary }}</h2>
        <p>
          Status: <strong>{{ issue.fields.status.name }}</strong>
        </p>

        <p>
          Assignee:
          <strong v-if="issue.fields.assignee">
            <img
              v-if="issue.fields.assignee.avatarUrls?.['48x48']"
              :src="issue.fields.assignee.avatarUrls['48x48']"
              alt="Assignee Avatar"
              class="assignee-avatar"
            />
            {{ issue.fields.assignee.displayName }}
            (<a :href="'mailto:' + issue.fields.assignee.emailAddress">{{
              issue.fields.assignee.emailAddress
            }}</a
            >)
          </strong>
          <strong v-else>Unassigned</strong>
        </p>

        <div v-if="issue.fields.description">
          <h3>Deskripsi:</h3>
          <pre class="description-box">{{
            typeof issue.fields.description === "string"
              ? issue.fields.description
              : JSON.stringify(issue.fields.description, null, 2)
          }}</pre>
        </div>
      </div>
    </div>

    <div v-else class="not-found-state">
      <p>Data tiket tidak ditemukan atau format tidak sesuai.</p>
      <p>Pastikan ID tiket "{{ issueId }}" benar.</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

h2 {
  font-size: 2rem;
  color: #0052cc; /* Warna khas Jira */
  margin-bottom: 10px;
}

h3 {
  font-size: 1.5rem;
  color: #555;
  margin-top: 20px;
  margin-bottom: 10px;
}

p {
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: #444;
}

strong {
  font-weight: 600;
}

.text-red-500 {
  color: #ef4444;
}

.text-gray-600 {
  color: #4b5563;
}

.font-bold {
  font-weight: bold;
}

/* --- Loading State (Skeleton) --- */
.loading-state,
.error-state,
.not-found-state {
  text-align: center;
  padding: 40px 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.skeleton-container {
  padding: 20px;
  background-color: #f0f0f0;
  border-radius: 8px;
  margin-top: 20px;
  animation: pulse-bg 1.5s infinite;
}

.skeleton-h2 {
  height: 30px;
  width: 80%;
  background-color: #e0e0e0;
  margin-bottom: 15px;
  border-radius: 4px;
}

.skeleton-p {
  height: 18px;
  width: 60%;
  background-color: #e0e0e0;
  margin-bottom: 10px;
  border-radius: 4px;
}

.skeleton-p.large {
  width: 70%;
}

.skeleton-p.small {
  width: 40%;
}

@keyframes pulse-bg {
  0% {
    background-color: #f0f0f0;
  }
  50% {
    background-color: #e0e0e0;
  }
  100% {
    background-color: #f0f0f0;
  }
}

/* --- Issue Details Specifics --- */
.issue-details {
  padding: 20px;
  background-color: #fcfcfc;
  border: 1px solid #eee;
  border-radius: 8px;
}

.assignee-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  vertical-align: middle;
  margin-right: 8px;
}

.description-box {
  background-color: #f4f5f7; /* Warna latar belakang editor Jira */
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-wrap; /* Mempertahankan format baris baru */
  word-break: break-word; /* Mencegah overflow kata */
  max-height: 300px; /* Batasi tinggi jika deskripsi panjang */
  overflow-y: auto; /* Aktifkan scroll jika deskripsi panjang */
  font-family: monospace; /* Font monospasi untuk kode */
  color: #333;
}
</style>
