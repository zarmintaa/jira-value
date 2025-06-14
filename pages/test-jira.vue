<script lang="ts" setup>
import { ref } from "vue";

const result = ref<any>(null);
const isLoading = ref(false);
const error = ref<any>(null);

async function runTest() {
  isLoading.value = true;
  error.value = null;
  result.value = null;

  try {
    // Ini adalah JQL yang sama dengan yang digunakan di endpoint KPI
    const jql = `project = "ITBOA" AND issuetype = Sub-task AND created >= "-7d"`;

    console.log("Mengirim JQL:", jql);

    // Kita panggil langsung endpoint proxy search
    const response = await $fetch("/api/jira/search", {
      method: "POST",
      body: {
        jql,
        fields: ["summary", "status"], // Minta beberapa field untuk tes
        maxResults: 5,
      },
    });

    result.value = response;
  } catch (e) {
    error.value = e;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="container mt-5">
    <div class="card">
      <div class="card-header">
        <h4>Jira API Proxy Tester</h4>
      </div>
      <div class="card-body">
        <p>
          Klik tombol di bawah ini untuk memanggil
          <code>/api/jira/search</code> secara langsung dengan query untuk
          mencari subtask yang dibuat dalam 7 hari terakhir.
        </p>
        <button :disabled="isLoading" class="btn btn-primary" @click="runTest">
          <span
            v-if="isLoading"
            class="spinner-border spinner-border-sm"
          ></span>
          {{ isLoading ? "Mengetes..." : "Jalankan Tes API" }}
        </button>

        <hr class="my-4" />

        <h5>Hasil Mentah dari API:</h5>

        <div v-if="error" class="alert alert-danger">
          <strong>Terjadi Error!</strong>
          <pre class="mt-2">{{
            JSON.stringify(error.data || error, null, 2)
          }}</pre>
        </div>

        <div v-if="result" class="bg-light p-3 rounded">
          <pre>{{ JSON.stringify(result, null, 2) }}</pre>
        </div>

        <div v-if="!error && !result && !isLoading" class="text-muted">
          Belum ada hasil. Klik tombol untuk memulai.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
