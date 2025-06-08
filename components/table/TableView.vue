<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps<{
  items: Record<string, any>[];
  tHeader?: string[];
  tKey?: string[];
  itemsPerPage?: number;
  loading?: boolean;
  error?: string | null;
  columnLinks?: Record<string, (row: any) => string>;
  onRowClick?: (row: any) => void;
  enableKeyboardNavigation?: boolean;
}>();

const searchQuery = ref("");
const currentPage = ref(1);
const sortOrder = ref<"asc" | "desc">("asc");
const sortColumn = ref("");
const selectedPerPage = ref(props.itemsPerPage ?? 10);
const jumpToPageInput = ref<number | null>(null);

const perPage = computed(() => selectedPerPage.value);
const headers = computed(
  () => props.tHeader ?? Object.keys(props.items[0] ?? {}),
);
const keys = computed(() => props.tKey ?? Object.keys(props.items[0] ?? {}));

const localLoading = ref(true);

const filteredItems = computed(() => {
  if (props.loading || props.error) return [];
  if (!searchQuery.value) return props.items;
  return props.items.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchQuery.value.toLowerCase()),
    ),
  );
});

const sortedItems = computed(() => {
  const data = [...filteredItems.value];
  if (sortColumn.value) {
    return data.sort((a, b) => {
      const aVal = a[sortColumn.value];
      const bVal = b[sortColumn.value];
      if (aVal == null || bVal == null) return 0;
      return sortOrder.value === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
          ? 1
          : -1;
    });
  }
  return data;
});

// Enhanced pagination computed properties
const totalPages = computed(() =>
  Math.ceil(filteredItems.value.length / perPage.value),
);
const startItem = computed(() => {
  if (filteredItems.value.length === 0) return 0;
  return (currentPage.value - 1) * perPage.value + 1;
});
const endItem = computed(() =>
  Math.min(currentPage.value * perPage.value, filteredItems.value.length),
);

/*const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 2; // Show 2 pages on each side

  if (total <= 7) {
    // If total pages <= 7, show all pages
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let start = Math.max(1, current - delta);
  let end = Math.min(total, current + delta);

  // Adjust if we're near the beginning or end
  if (current <= delta + 1) {
    end = Math.min(total, delta * 2 + 1);
  }
  if (current >= total - delta) {
    start = Math.max(1, total - delta * 2);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});*/

/*const showStartEllipsis = computed(() => {
  return totalPages.value > 7 && visiblePages.value[0] > 2;
});

const showEndEllipsis = computed(() => {
  return (
    totalPages.value > 7 &&
    visiblePages.value[visiblePages.value.length - 1] < totalPages.value - 1
  );
});*/

const paginatedItems = ref<Record<string, any>[]>([]);

const updatePagination = () => {
  try {
    localLoading.value = true;
    const start = (currentPage.value - 1) * perPage.value;
    paginatedItems.value = sortedItems.value.slice(
      start,
      start + perPage.value,
    );
  } catch (error) {
    console.error("Pagination error:", error);
  } finally {
    localLoading.value = false;
  }
};

watch([sortedItems, currentPage, perPage], updatePagination, {
  immediate: true,
});

watch([searchQuery, sortColumn, sortOrder, selectedPerPage], () => {
  currentPage.value = 1;
  jumpToPageInput.value = null;
});

// Enhanced navigation functions
function toggleSort(column: string) {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = column;
    sortOrder.value = "asc";
  }
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    jumpToPageInput.value = null;
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function goToFirstPage() {
  currentPage.value = 1;
}

function goToLastPage() {
  currentPage.value = totalPages.value;
}

function jumpToPage() {
  if (
    jumpToPageInput.value &&
    jumpToPageInput.value >= 1 &&
    jumpToPageInput.value <= totalPages.value
  ) {
    goToPage(jumpToPageInput.value);
  }
}

function getRowNumber(index: number): number {
  return (currentPage.value - 1) * perPage.value + index + 1;
}

function formatValue(value: any, key: string) {
  if (
    (typeof value === "number" && key.toLowerCase().includes("price")) ||
    (typeof value === "number" && key.toLowerCase().includes("margin"))
  ) {
    return `Rp ${value.toLocaleString("id-ID")}`;
  }
  return value || "-";
}

// Keyboard navigation
function handleKeyNavigation(event: KeyboardEvent) {
  // Only handle if no input is focused and keyboard nav is enabled
  if (
    !props.enableKeyboardNavigation ||
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLSelectElement
  ) {
    return;
  }

  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      prevPage();
      break;
    case "ArrowRight":
      event.preventDefault();
      nextPage();
      break;
    case "Home":
      event.preventDefault();
      goToFirstPage();
      break;
    case "End":
      event.preventDefault();
      goToLastPage();
      break;
  }
}

onMounted(() => {
  if (props.enableKeyboardNavigation) {
    document.addEventListener("keydown", handleKeyNavigation);
  }
});

onUnmounted(() => {
  if (props.enableKeyboardNavigation) {
    document.removeEventListener("keydown", handleKeyNavigation);
  }
});
</script>

<template>
  <div>
    <!-- Search and Controls -->
    <div class="d-flex align-items-center justify-content-between mb-4 gap-4">
      <input
        v-model="searchQuery"
        class="form-control w-100"
        placeholder="Search..."
        type="text"
      />
      <div class="d-flex gap-3">
        <select
          v-model="selectedPerPage"
          class="form-select"
          style="width: 7rem"
        >
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <div class="table-scroll">
        <table class="table table-hover">
          <thead>
            <tr>
              <th
                v-if="!props.loading && !localLoading && !props.error"
                class="fw-semibold text-black"
              >
                No
              </th>
              <th
                v-for="(header, idx) in headers"
                :key="header"
                :title="`Sort by ${header}`"
                class="fw-semibold text-black user-select-none"
                style="min-width: 150px; cursor: pointer"
                @click="toggleSort(keys[idx])"
              >
                {{ header }}
                <span v-if="sortColumn === keys[idx]" class="sort-indicator">
                  {{ sortOrder === "asc" ? "↑" : "↓" }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- SKELETON -->
            <template v-if="props.loading || localLoading">
              <tr v-for="n in perPage || 5" :key="'skeleton-' + n">
                <td v-for="key in keys.length + 1" :key="key + n">
                  <div class="skeleton" />
                </td>
              </tr>
            </template>

            <!-- ERROR -->
            <template v-else-if="props.error">
              <tr>
                <td
                  :colspan="keys.length + 1"
                  class="text-center py-4 text-danger"
                >
                  <div class="empty-state">
                    <div class="emoji">🚫</div>
                    <div class="message">{{ props.error }}</div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- NO DATA -->
            <template v-else-if="paginatedItems.length === 0">
              <tr>
                <td
                  :colspan="keys.length + 1"
                  class="text-center py-4 text-muted"
                >
                  <div class="empty-state">
                    <div class="emoji">📭</div>
                    <div class="message">
                      {{
                        searchQuery
                          ? `There no data with name '${searchQuery}' .`
                          : "Data not found."
                      }}
                    </div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- DATA -->
            <template v-else>
              <tr
                v-for="(item, idx) in paginatedItems"
                :key="idx"
                :style="{ cursor: props.onRowClick ? 'pointer' : 'default' }"
                class="clickable-row"
                @click="props.onRowClick?.(item)"
              >
                <td class="fw-medium">{{ getRowNumber(idx) }}</td>
                <td
                  v-for="key in keys"
                  :key="key"
                  :title="item[key] || '-'"
                  class="text-truncate text-black"
                  style="max-width: 400px"
                >
                  <template v-if="props.columnLinks && props.columnLinks[key]">
                    <router-link
                      :to="props.columnLinks[key](item)"
                      class="text-primary text-decoration-none"
                      @click.stop
                    >
                      {{ formatValue(item[key], key) }}
                    </router-link>
                  </template>
                  <template v-else>
                    {{ formatValue(item[key], key) }}
                  </template>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Enhanced Pagination -->
    <div
      v-if="!props.loading && !props.error && filteredItems.length > 0"
      class="pagination"
    >
      <!-- Pagination Info -->
      <div class="pagination-info">
        <span class="text-muted">
          Showing {{ startItem.toLocaleString() }} to
          {{ endItem.toLocaleString() }} of
          {{ filteredItems.length.toLocaleString() }} entries
        </span>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="pagination-controls">
        <!-- First & Previous -->
        <button
          :disabled="currentPage === 1"
          class="btn btn-sm btn-light-indigo"
          title="First Page"
          @click="goToFirstPage"
        >
          First
        </button>

        <button
          :disabled="currentPage === 1"
          class="btn btn-sm btn-light-indigo"
          title="Previous Page"
          @click="prevPage"
        >
          Previous
        </button>

        <!-- Page Numbers (only show current page info) -->
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>

        <!-- Next & Last -->
        <button
          :disabled="currentPage >= totalPages"
          class="btn btn-sm btn-light-indigo"
          title="Next Page"
          @click="nextPage"
        >
          Next
        </button>

        <button
          :disabled="currentPage >= totalPages"
          class="btn btn-sm btn-light-indigo"
          title="Last Page"
          @click="goToLastPage"
        >
          Last
        </button>
      </div>

      <!-- Jump to Page (compact version) -->
      <div v-if="totalPages > 5" class="jump-to-page-compact">
        <input
          v-model.number="jumpToPageInput"
          :max="totalPages"
          :min="1"
          :placeholder="`Go to page (1-${totalPages})`"
          class="form-control form-control-sm"
          style="width: 140px"
          type="number"
          @keyup.enter="jumpToPage"
        />
        <button
          :disabled="
            !jumpToPageInput ||
            jumpToPageInput < 1 ||
            jumpToPageInput > totalPages
          "
          class="btn btn-sm btn-outline-primary"
          @click="jumpToPage"
        >
          Go
        </button>
      </div>
    </div>

    <!-- Keyboard Navigation Hint -->
    <div
      v-if="props.enableKeyboardNavigation && totalPages > 1"
      class="keyboard-hint"
    >
      <small class="text-muted">
        💡 Use arrow keys (← →), Home, and End for navigation
      </small>
    </div>
  </div>
</template>

<style scoped>
.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.table-wrapper {
  max-height: 400px;
  overflow-y: auto;
}

.table-scroll {
  overflow-x: auto;
  min-width: 100%;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.skeleton {
  height: 14px;
  background-color: #e0e0e0;
  border-radius: 4px;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    background-color: #e0e0e0;
  }
  50% {
    background-color: #f0f0f0;
  }
  100% {
    background-color: #e0e0e0;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6c757d;
}

.empty-state .emoji {
  font-size: 2rem;
}

.empty-state .message {
  margin-top: 0.5rem;
  font-size: 0.95rem;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 20px;
  flex-wrap: wrap;
}

.pagination-info {
  flex: 1;
  text-align: left;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
}

.page-info {
  padding: 0 1rem;
  font-weight: 500;
  color: #495057;
}

.jump-to-page-compact {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.keyboard-hint {
  text-align: center;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f0f0f0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    gap: 0.75rem;
  }

  .pagination-info {
    text-align: center;
  }

  .pagination-controls {
    gap: 0.5rem;
  }

  .jump-to-page-compact {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
