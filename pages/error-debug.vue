<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useErrorStore } from "~/stores/error-store";
import { errorHandler } from "~/utils/errorHandler"; // Kita pakai ini
import type { JiraIssue } from "~/types/jira";
import { useSafeFetch } from "~/composable/useSafeFetch";
// TIDAK ADA import jiraService

const errorStore = useErrorStore();
const { allErrors, currentError: activeError } = storeToRefs(errorStore);
const { addError, clearAllErrors } = errorStore;

const data = ref<JiraIssue | null>(null);
const isLoadingApi = ref(false);

// Test 3: JavaScript error - Menggunakan errorHandler.catch
const testJavaScriptError = () => {
  try {
    throw new Error("This is a JavaScript error for testing");
  } catch (e) {
    // Memanggil utility errorHandler, bukan store langsung
    errorHandler.catch(e, "JavaScript Error Terjadi");
  }
};

// Test 7: Promise rejection - Menggunakan errorHandler.catch
const testPromiseRejection = () => {
  Promise.reject(new Error("This is a rejected promise (simulasi)")).catch(
    (error) => {
      errorHandler.catch(error, "Promise Rejection Terdeteksi");
    },
  );
};

// ... fungsi tes lain yang memanggil addError secara langsung tetap sama ...
const testSimpleError = () =>
  addError({ type: "general", message: "This is a simple test error" });
const testValidationError = () =>
  addError({
    type: "validation",
    title: "Validation Error",
    message: "Username must be at least 5 characters long",
  });

// Test 9: Real API Call - Langsung menggunakan useSafeFetch
const testApiCall = async () => {
  isLoadingApi.value = true;
  data.value = null;

  // useSafeFetch mengembalikan 'data' dan 'error' secara terpisah
  const { data: issueData, error } = await useSafeFetch<JiraIssue>(
    "/api/jira/ITBOA-16349",
  );

  // PERBAIKAN: Cek variabel 'error' yang ada di level atas.
  // Jika TIDAK ada error (error.value adalah null), dan issueData punya nilai,
  // maka kita bisa dengan aman mengatur datanya.
  if (!error.value && issueData.value) {
    data.value = issueData.value;
  }

  // 'useSafeFetch' sudah otomatis menangani pengiriman error ke store untuk toast,
  // jadi kita tidak perlu melakukan apa-apa lagi di sini jika terjadi error.
  // Blok 'if' di atas hanya untuk menangani kasus sukses.

  isLoadingApi.value = false;
};
</script>

<template>
  <div class="card">
    <div class="card-body">
      <h1>Error Handling Test Page</h1>

      <div class="test-buttons">
        <h3>Test Buttons:</h3>
        <div class="button-grid">
          <button class="btn btn-primary" @click="testSimpleError">
            1. Simple Error
          </button>
          <button class="btn btn-danger" @click="testJavaScriptError">
            3. JS Error (via errorHandler)
          </button>
          <button class="btn btn-warning" @click="testValidationError">
            4. Validation Error
          </button>
          <button class="btn btn-danger" @click="testPromiseRejection">
            7. Promise Reject (via errorHandler)
          </button>
          <button
            class="btn btn-success"
            @click="testApiCall"
            :disabled="isLoadingApi"
          >
            <span v-if="isLoadingApi">Loading...</span>
            <span v-else>9. Real API Call (via useSafeFetch)</span>
          </button>
          <button
            class="btn btn-dark"
            style="grid-column: span 2"
            @click="clearAllErrors"
          >
            Clear All Errors
          </button>
        </div>
      </div>

      <div v-if="data" class="data-section">
        <h3>API Data (JiraIssue):</h3>
        <pre>{{ JSON.stringify(data, null, 2) }}</pre>
      </div>

      <div class="debug-section" style="margin-top: 30px">
        <h3>All Errors Currently in Store (allErrors):</h3>
        <div v-if="allErrors && allErrors.length > 0">
          <div v-for="err in allErrors" :key="err.id" class="error-list-item">
            <p>
              <strong>ID:</strong> {{ err.id }} | <strong>Type:</strong>
              {{ err.type }}
            </p>
            <p><strong>Title:</strong> {{ err.title }}</p>
          </div>
        </div>
        <div v-else><p>No errors in the store.</p></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Style Anda sudah bagus, tidak perlu diubah */
.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-primary {
  background-color: #0d6efd;
  color: white;
}
.btn-danger {
  background-color: #dc3545;
  color: white;
}
.btn-warning {
  background-color: #ffc107;
  color: black;
}
.btn-success {
  background-color: #198754;
  color: white;
}
.btn-dark {
  background-color: #212529;
  color: white;
}
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
}
.card-body {
  padding: 1.5rem;
}
.debug-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}
.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
  margin-top: 15px;
}
.data-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}
pre {
  background: #e9ecef;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
.error-list-item {
  border: 1px solid #eee;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
}
</style>
