<script lang="ts" setup>
import { computed } from "vue";
import { useUsers } from "~/composable/jira/useUser";
import TableView from "~/components/table/TableView.vue";

// 1. Siapkan composable dan router
const router = useRouter();
const { getAllUsers } = useUsers();

// 2. Ambil data semua user menggunakan useAsyncData untuk efisiensi dan SSR
const {
  data: users,
  pending: loading,
  error,
} = await useAsyncData(
  "all-jira-users-list", // Gunakan key yang unik
  () => getAllUsers(),
  { lazy: true }, // Gunakan lazy load agar loading indicator terlihat
);

// 3. Format data agar sesuai dengan yang dibutuhkan oleh TableView
const tableItems = computed(() => {
  if (!users.value) {
    return [];
  }
  return users.value.map((user) => ({
    // 'uuid' wajib ada untuk navigasi, tapi tidak akan kita tampilkan sebagai kolom
    uuid: user.uuid,
    key: user.key,
    nama: user.display_name,
    email: user.email_address,
    squad: user.jira_squads?.display_name ?? "Tanpa Squad",
  }));
});

// 4. Siapkan header dan key untuk TableView secara dinamis
const rawKeys = computed(() => {
  if (!tableItems.value || tableItems.value.length === 0) {
    return [];
  }
  // Ambil semua key dari objek, KECUALI 'uuid'
  return Object.keys(tableItems.value[0]).filter((key) => key !== "uuid");
});

const headers = computed(() =>
  rawKeys.value.map((key) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
  ),
);

// 5. Siapkan fungsi navigasi ke halaman detail
const navigateToUserDetail = (row: { uuid: string }) => {
  // Arahkan ke halaman detail user berdasarkan UUID
  router.push(`/users/${row.uuid}`);
};

const errorMessage = computed(() => error.value?.message || null);
</script>

<template>
  <div class="card border-0 shadow-sm">
    <div
      class="card-header bg-white py-4 d-flex align-items-center justify-content-between"
    >
      <h3 class="fw-semibold mb-0">Daftar User Jira</h3>
      <NuxtLink class="btn btn-primary" to="/users/new">
        + Tambah User
      </NuxtLink>
    </div>

    <div class="card-body">
      <TableView
        :error="errorMessage"
        :items="tableItems"
        :itemsPerPage="10"
        :loading="loading"
        :onRowClick="navigateToUserDetail"
        :tHeader="headers"
        :tKey="rawKeys"
      />
    </div>
  </div>
</template>

<style scoped>
/* Styling jika diperlukan */
.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}
</style>
