<script lang="ts" setup>
import { computed } from "vue";
import { formatReadableDate } from "~/utils/day";
import { useSquads } from "~/composable/jira/useSquad";

// 1. Dapatkan router dan fungsi dari composable
const router = useRouter();
const { getAllSquads } = useSquads();

// 2. Ambil data squad menggunakan useAsyncData
const {
  data: squads,
  pending: loading,
  error,
} = await useAsyncData(
  "all-squads", // Kunci unik untuk data squad
  () => getAllSquads(),
);

// 3. Buat computed property untuk memformat data agar sesuai dengan TableView
const tableItems = computed(() => {
  if (!squads.value) {
    return [];
  }
  // Petakan data dari Supabase ke struktur yang lebih datar dan ramah-tampilan
  return squads.value.map((squad) => ({
    uuid: squad.uuid, // Simpan UUID untuk navigasi, tapi tidak kita tampilkan
    squad_name: squad.display_name,
    squad_lead: squad.lead?.display_name ?? "Belum Ditentukan", // Ambil nama lead dari relasi
    email_contact: squad.email_address,
    created: formatReadableDate(squad.created_at),
  }));
});

// 4. Buat keys dan headers untuk TableView secara dinamis dari data yang diformat
const rawKeys = computed(() => {
  if (!tableItems.value || tableItems.value.length === 0) {
    return [];
  }
  // Ambil semua keys dari objek pertama, kecuali 'uuid'
  return Object.keys(tableItems.value[0]).filter((key) => key !== "uuid");
});

const headers = computed(() =>
  rawKeys.value.map((key) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
  ),
);

// 5. Siapkan fungsi untuk navigasi saat baris di-klik
const navigateToSquadDetail = (row: any) => {
  // Tambahkan console.log untuk melihat isi 'row'
  console.log("Data baris yang diklik:", row);

  // Cek secara spesifik nilai row.uuid
  console.log("UUID yang akan digunakan untuk navigasi:", row.uuid);

  // Jika row.uuid undefined, navigasi akan gagal.
  if (row.uuid) {
    router.push(`/squads/${row.uuid}`);
  } else {
    console.error(
      "Navigasi dibatalkan karena UUID tidak ditemukan pada baris ini.",
    );
  }
};

// Ambil pesan error jika ada
const errorMessage = computed(() => error.value?.message || null);
</script>

<template>
  <div class="card border-0 shadow-sm">
    <div
      class="card-header bg-white py-4 d-flex align-items-center justify-content-between"
    >
      <h3 class="fw-semibold mb-0">List Squad</h3>
      <NuxtLink to="/squads/new"
        ><button class="btn btn-primary text-decoration-none">
          + Tambah Squad
        </button></NuxtLink
      >
    </div>

    <div class="card-body">
      <TableView
        :error="errorMessage"
        :items="tableItems"
        :itemsPerPage="10"
        :loading="loading"
        :onRowClick="navigateToSquadDetail"
        :tHeader="headers"
        :tKey="rawKeys"
      />
    </div>
  </div>
</template>

<style scoped>
/* Anda bisa tambahkan style khusus di sini jika perlu */
.btn-primary {
  /* Contoh styling untuk tombol */
  background-color: #007bff;
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}
</style>
