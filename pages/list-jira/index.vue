// list-jira/index

<script lang="ts" setup>
// 1. Hapus import data dummy
// import { dummyJiraUser } from "~/data/dummy-jira";
import { computed, ref } from "vue";
// Hapus juga import JiraUser yang lama jika tidak dipakai di tempat lain
// import type { JiraUser } from "~/types/jira";
import TableView from "~/components/table/TableView.vue";
import { formatReadableDate } from "~/utils/day";
// 2. Gunakan composable useUsers yang sudah kita buat
import { useUsers } from "~/composable/jira/useUser";

const router = useNuxtApp().$router;
const { getAllUsers } = useUsers();

// 3. Ambil data secara asinkron menggunakan useAsyncData
// Ini cara terbaik di Nuxt karena menangani SSR, loading, dan error secara otomatis.
const {
  data: jiraUsers,
  pending: loading,
  error,
} = await useAsyncData(
  "all-jira-users",
  () => getAllUsers(),
  { lazy: true }, // <-- Tambahkan opsi ini
);
// 4. Sesuaikan computed property 'allJira' untuk memetakan data dari Supabase
const allJira = computed(() => {
  // Jika jiraUsers.value masih kosong atau null, kembalikan array kosong
  if (!jiraUsers.value) {
    return [];
  }

  // Petakan data dari struktur Supabase ke struktur yang dibutuhkan oleh TableView
  return jiraUsers.value.map((user) => ({
    // nama kolom di sini akan menjadi 'key' untuk header tabel
    key: user.key,
    assignee: user.display_name,
    summary: user.summary,
    // Kita tambahkan nama squads dari data relasi
    squad: user.jira_squads?.display_name ?? "Tanpa squads",
    email: user.email_address,
    // Kolom 'status' sudah kita hapus, jadi hilangkan dari sini
    // status: user.status,
    created: formatReadableDate(user.created_at), // gunakan 'created_at' dari Supabase
  }));
});

// Computed `rawKeys` dan `headers` di bawah ini akan bekerja secara otomatis
// dengan struktur baru dari `allJira` tanpa perlu diubah.
const rawKeys = computed(() => {
  if (!allJira.value || allJira.value.length === 0) {
    return [];
  }
  return Object.keys(allJira.value[0]);
});

const headers = computed(() =>
  rawKeys.value.map(
    (key) =>
      key
        .replace(/_/g, " ") // Ganti underscore dengan spasi
        .replace(/\b\w/g, (char) => char.toUpperCase()), // Kapitalisasi setiap kata
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
        :itemsPerPage="50"
        :loading="loading"
        :onRowClick="navigateToJiraDetail"
        :tHeader="headers"
        :tKey="rawKeys"
      />
    </div>
  </div>
</template>

<style scoped></style>
