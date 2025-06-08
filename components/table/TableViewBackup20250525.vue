<script lang="ts" setup>
import { computed, ref, watch } from "vue";

const props = defineProps<{
  items: Record<string, any>[];
  tHeader?: string[];
  tKey?: string[];
  itemsPerPage?: number;
  loading?: boolean;
  error?: string | null;
  columnLinks?: Record<string, (row: any) => string>;
  onRowClick?: (row: any) => void; // ⬅️ Tambahkan ini
}>();
const searchQuery = ref("");
const currentPage = ref(1);
const sortOrder = ref<"asc" | "desc">("asc");
const sortColumn = ref("");
const selectedPerPage = ref(props.itemsPerPage ?? 10);

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

const paginatedItems = ref<Record<string, any>[]>([]);

const updatePagination = () => {
  localLoading.value = true;
  const start = (currentPage.value - 1) * perPage.value;
  paginatedItems.value = sortedItems.value.slice(start, start + perPage.value);
  localLoading.value = false;
};

watch([sortedItems, currentPage, perPage], updatePagination, {
  immediate: true,
});
watch([searchQuery, sortColumn, sortOrder, selectedPerPage], () => {
  currentPage.value = 1;
});

function toggleSort(column: string) {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = column;
    sortOrder.value = "asc";
  }
}

function nextPage() {
  if (
    currentPage.value < Math.ceil(filteredItems.value.length / perPage.value)
  ) {
    currentPage.value++;
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
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
</script>

<template>
  <div class="d-flex align-items-center justify-content-between mb-4 gap-4">
    <input
      v-model="searchQuery"
      class="form-control w-100"
      placeholder="Search..."
      type="text"
    />
    <div class="d-flex gap-3">
      <select v-model="selectedPerPage" class="form-select" style="width: 7rem">
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
      </select>
    </div>
  </div>

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
              class="fw-semibold text-black"
              style="min-width: 150px; cursor: pointer"
              @click="toggleSort(keys[idx])"
            >
              {{ header }}
              <span v-if="sortColumn === keys[idx]">
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
                  <div class="message">Tidak ada data yang ditemukan.</div>
                </div>
              </td>
            </tr>
          </template>

          <!-- DATA -->
          <template v-else>
            <tr
              v-for="(item, idx) in paginatedItems"
              :key="idx"
              class="clickable-row"
              @click="props.onRowClick?.(item)"
            >
              <td>{{ getRowNumber(idx) }}</td>
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

  <div class="pagination">
    <button
      :disabled="currentPage === 1"
      class="btn btn-sm btn-light-indigo"
      @click="prevPage"
    >
      Previous
    </button>
    <span>
      Page {{ currentPage }} of {{ Math.ceil(filteredItems.length / perPage) }}
    </span>
    <button
      :disabled="currentPage >= Math.ceil(filteredItems.length / perPage)"
      class="btn btn-sm btn-light-indigo"
      @click="nextPage"
    >
      Next
    </button>
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
  justify-content: center;
  gap: 1rem;
  margin-top: 20px;
}
</style>
