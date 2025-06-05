<script lang="ts" setup>
import { ref } from "vue"; // Import computed jika diperlukan di script
import { errorHandler, useErrorStore } from "@/stores/error-store"; //
import { jiraService } from "@/services/jira-service.ts"; //
import type { JiraIssue } from "@/utils/api.ts"; //

// Menggunakan allErrors dari store, activeError juga sudah computed dari store
const {
  addError,
  currentError: activeError,
  allErrors,
  clearAllErrors,
} = useErrorStore(); //
const data = ref<JiraIssue | null>(null);

// Test 1: Simple error
const testSimpleError = () => {
  console.log("🧪 Testing simple error");
  addError("This is a simple test error");
};

// Test 2: Error object
const testErrorObject = () => {
  console.log("🧪 Testing error object");
  addError({
    type: "general",
    title: "Test Error Object",
    message: "This is a test error object with custom title",
    details: { test: true, timestamp: new Date().toISOString() }, // Gunakan ISOString untuk serialisasi JSON yang lebih baik
  });
};

// Test 3: JavaScript error
const testJavaScriptError = () => {
  console.log("🧪 Testing JavaScript error");
  try {
    throw new Error("This is a JavaScript error for testing");
  } catch (e) {
    errorHandler.catch(e, "JavaScript Error Terjadi"); // Tangkap dan kirim ke store
  }
};

// Test 4: Validation error
const testValidationError = () => {
  console.log("🧪 Testing validation error");
  addError({
    type: "validation",
    title: "Validation Error",
    message: "Username must be at least 5 characters long",
  });
};

// Test 5: API error simulation
const testApiError = () => {
  console.log("🧪 Testing API error");
  addError({
    type: "api",
    title: "API Error",
    message: "Failed to fetch user data",
    statusCode: 404,
    details: { endpoint: "/api/user/123", method: "GET" },
  });
};

// Test 6: Network error
const testNetworkError = () => {
  console.log("🧪 Testing network error");
  addError({
    type: "network",
    title: "Network Error",
    message: "Unable to connect to server",
  });
};

// Test 7: Promise rejection
const testPromiseRejection = () => {
  console.log("🧪 Testing promise rejection");
  Promise.reject(new Error("This is a rejected promise (simulasi)")).catch(
    (error) => {
      errorHandler.catch(error, "Promise Rejection Terdeteksi");
    },
  );
};

// Test 8: Async error
const testAsyncError = async () => {
  console.log("🧪 Testing async error");
  try {
    await new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("This is an async error (simulasi)"));
      }, 1000);
    });
  } catch (error) {
    errorHandler.catch(error, "Async Operation Error");
  }
};

// Original API call test
const testApiCall = async () => {
  console.log("🧪 Testing API call");
  // Gunakan errorHandler.handle untuk menangkap error dari service secara otomatis
  const issue = await errorHandler.handle(() =>
    jiraService.getIssue("ITBOA-16349"),
  ); //
  if (issue) {
    data.value = issue;
  }
  // Jika error, errorHandler.handle akan memanggil addError secara otomatis
};

// Fungsi untuk membersihkan semua error, diambil dari store
const clearErrors = () => {
  console.log("🗑️ Clearing all errors from ErrorDebug.vue");
  clearAllErrors();
};
</script>

<template>
  <div class="test-page">
    <h1>Error Handling Test Page</h1>

    <div class="debug-section">
      <h3>Debug Info (Store State):</h3>
      <div>
        Active Error (currentError):
        {{ activeError ? `Yes - ID: ${activeError.id}` : "No" }}
      </div>
      <div>Total Errors in Store: {{ allErrors.length }}</div>
      <div v-if="activeError">
        <strong>Current Displayed Error (activeError):</strong>
        <pre>{{ JSON.stringify(activeError, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-buttons">
      <h3>Test Buttons:</h3>
      <div class="button-grid">
        <button class="btn-primary" @click="testSimpleError">
          1. Simple Error (String)
        </button>
        <button class="btn-primary" @click="testErrorObject">
          2. Error Object (Custom)
        </button>
        <button class="btn-danger" @click="testJavaScriptError">
          3. JavaScript Error (throw)
        </button>
        <button class="btn-warning" @click="testValidationError">
          4. Validation Error
        </button>
        <button class="btn-info" @click="testApiError">
          5. API Error (Simulasi)
        </button>
        <button class="btn-secondary" @click="testNetworkError">
          6. Network Error (Simulasi)
        </button>
        <button class="btn-danger" @click="testPromiseRejection">
          7. Promise Rejection
        </button>
        <button class="btn-danger" @click="testAsyncError">
          8. Async Error
        </button>
        <button class="btn-success" @click="testApiCall">
          9. Real API Call (getIssue)
        </button>
        <button
          class="btn-dark"
          style="grid-column: span 2"
          @click="clearErrors"
        >
          Clear All Errors from Store
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
        <div
          v-for="err in allErrors"
          :key="err.id"
          :style="{ borderColor: err.type === 'api' ? 'red' : 'grey' }"
          class="error-list-item"
        >
          <p><strong>ID:</strong> {{ err.id }}</p>
          <p><strong>Title:</strong> {{ err.title }}</p>
          <p><strong>Message:</strong> {{ err.message }}</p>
          <p><strong>Type:</strong> {{ err.type }}</p>
          <p>
            <strong>Timestamp:</strong>
            {{ new Date(err.timestamp).toLocaleString() }}
          </p>
          <p>
            <strong>AutoRemoveTimer active:</strong>
            {{ err.autoRemoveTimer ? "Yes" : "No" }}
          </p>
        </div>
      </div>
      <div v-else>
        <p>No errors in the store.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-page {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  font-family: "Roboto", Arial, sans-serif; /* */
}

.debug-section {
  background: #f8f9fa; /* */
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  border: 1px solid #dee2e6;
}

.debug-section pre {
  background: white;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  max-height: 200px;
}

.test-buttons {
  margin: 30px 0;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

button {
  padding: 12px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
  text-align: left;
}

.btn-primary {
  background: var(--bs-primary);
  color: white;
}

/* */
.btn-primary:hover {
  background: #0056b3;
}

.btn-danger {
  background: var(--bs-danger);
  color: white;
}

/* */
.btn-danger:hover {
  background: #c82333;
}

.btn-warning {
  background: var(--bs-warning);
  color: #212529;
}

/* */
.btn-warning:hover {
  background: #e0a800;
}

.btn-info {
  background: var(--bs-info);
  color: white;
}

/* */
.btn-info:hover {
  background: #138496;
}

.btn-secondary {
  background: var(--bs-secondary);
  color: white;
}

/* */
.btn-secondary:hover {
  background: #5a6268;
}

.btn-success {
  background: var(--bs-success);
  color: white;
}

/* */
.btn-success:hover {
  background: #218838;
}

.btn-dark {
  background: var(--bs-dark);
  color: white;
}

/* */
.btn-dark:hover {
  background: #1c1f23;
}

.data-section {
  background: #f8f9fa; /* */
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.data-section pre {
  background: white;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

h3 {
  color: var(--bs-heading-color); /* */
  margin-bottom: 15px;
}

.error-list-item {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
}

.error-list-item p {
  margin: 5px 0;
  font-size: 0.9em;
}

.error-list-item strong {
  font-weight: 500; /* */
}
</style>
