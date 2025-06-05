<script setup lang="ts">
import { ref } from "vue";
import { useErrorStore } from "@/stores/error-store";
import { jiraService } from "@/services/jira-service.ts";
import type { JiraIssue } from "@/utils/api.ts";

const { addError, activeError, errors } = useErrorStore();
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
    details: { test: true, timestamp: new Date() },
  });
};

// Test 3: JavaScript error
const testJavaScriptError = () => {
  console.log("🧪 Testing JavaScript error");
  throw new Error("This is a JavaScript error for testing");
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
  Promise.reject(new Error("This is a rejected promise"));
};

// Test 8: Async error
const testAsyncError = async () => {
  console.log("🧪 Testing async error");
  await new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("This is an async error"));
    }, 1000);
  });
};

// Original API call test
const testApiCall = async () => {
  console.log("🧪 Testing API call");
  const issue = await jiraService.getIssue("ITBOA-16349");
  if (issue) {
    data.value = issue;
  }
};
</script>

<template>
  <div class="test-page">
    <h1>Error Handling Test Page</h1>

    <!-- Debug info -->
    <div class="debug-section">
      <h3>Debug Info:</h3>
      <div>Active Error: {{ activeError ? "Yes" : "No" }}</div>
      <div>Total Errors: {{ errors.length }}</div>
      <div v-if="activeError">
        <strong>Current Error:</strong>
        <pre>{{ JSON.stringify(activeError, null, 2) }}</pre>
      </div>
    </div>

    <!-- Test buttons -->
    <div class="test-buttons">
      <h3>Test Buttons:</h3>
      <div class="button-grid">
        <button @click="testSimpleError" class="btn-primary">
          1. Simple Error
        </button>

        <button @click="testErrorObject" class="btn-primary">
          2. Error Object
        </button>

        <button @click="testJavaScriptError" class="btn-danger">
          3. JavaScript Error
        </button>

        <button @click="testValidationError" class="btn-warning">
          4. Validation Error
        </button>

        <button @click="testApiError" class="btn-info">5. API Error</button>

        <button @click="testNetworkError" class="btn-secondary">
          6. Network Error
        </button>

        <button @click="testPromiseRejection" class="btn-danger">
          7. Promise Rejection
        </button>

        <button @click="testAsyncError" class="btn-danger">
          8. Async Error
        </button>

        <button @click="testApiCall" class="btn-success">
          9. Real API Call
        </button>
      </div>
    </div>

    <!-- Data display -->
    <div v-if="data" class="data-section">
      <h3>API Data:</h3>
      <pre>{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.test-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.debug-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  border: 1px solid #dee2e6;
}

.debug-section pre {
  background: white;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
  font-size: 12px;
  max-height: 200px;
}

.test-buttons {
  margin: 20px 0;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

button {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #138496;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.data-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.data-section pre {
  background: white;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
  font-size: 12px;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

h3 {
  color: #555;
  margin-bottom: 15px;
}
</style>
