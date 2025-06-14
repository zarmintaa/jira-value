<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useUsers } from "~/composable/jira/useUser";
import type { JiraUserBasicInfo } from "~/types/supabase-table";

// Siapkan state dan fungsi
const router = useRouter();
const { getAvailableUsers } = useUsers();

const errorMessage = ref<string | null>(null);
// Ganti alert dengan state ini
const successMessage = ref<string | null>(null);

const form = ref({
  display_name: "",
  email_address: "",
  lead_uuid: null as string | null,
  member_uuids: [] as string[],
});

const availableUsers = ref<JiraUserBasicInfo[]>([]);
const isLoading = ref(false);
const isFetchingUsers = ref(true);

// State baru untuk mengontrol modal
const isSuccessModalVisible = ref(false);

// Fungsi untuk menutup modal dan redirect
function closeModalAndRedirect() {
  isSuccessModalVisible.value = false;
  router.push("/squads");
}

// Ambil data user yang tersedia saat komponen dimuat
onMounted(async () => {
  isFetchingUsers.value = true;
  const users = await getAvailableUsers();
  if (users) {
    availableUsers.value = users;
  }
  isFetchingUsers.value = false;
});

async function handleSubmit() {
  isLoading.value = true;
  // Reset pesan error setiap kali submit
  errorMessage.value = null;

  try {
    await $fetch("/api/squads/create-with-members", {
      method: "POST",
      body: form.value,
    });

    successMessage.value = `Squad "${form.value.display_name}" berhasil dibuat.`;
    isSuccessModalVisible.value = true;
  } catch (error: any) {
    // HAPUS alert()
    // alert(error.data?.statusMessage || "Gagal membuat squad");

    // GANTI DENGAN INI: Set state errorMessage agar modal error muncul
    errorMessage.value =
      error.data?.statusMessage || "Terjadi kesalahan yang tidak diketahui.";
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <AppModal
    :show="isSuccessModalVisible"
    @close="closeModalAndRedirect"
    @confirm="closeModalAndRedirect"
    confirm-text="OK"
  >
    <template #header><h5 class="fw-semibold mb-0">Berhasil!</h5></template>
    <template #default
      ><p>{{ successMessage }}</p></template
    >
  </AppModal>

  <AppModal
    :show="!!errorMessage"
    @close="errorMessage = null"
    @confirm="errorMessage = null"
    confirm-text="Tutup"
    confirm-button-type="secondary"
  >
    <template #header
      ><h5 class="fw-semibold mb-0 text-danger">Terjadi Kesalahan</h5></template
    >
    <template #default
      ><p>{{ errorMessage }}</p></template
    >
  </AppModal>
  <div class="card border-0 shadow-sm">
    <div
      class="card-header bg-white py-4 d-flex align-items-center justify-content-between"
    >
      <h3 class="fw-semibold mb-0">New Squad</h3>
      <NuxtLink to="/squads" class="btn btn-outline-secondary">
        &larr; Kembali ke List
      </NuxtLink>
    </div>
    <div class="card-body">
      <div v-if="isFetchingUsers" class="text-center p-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">Memuat daftar user...</p>
      </div>
      <form v-else @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label for="displayName" class="form-label">Nama Squad</label>
          <input
            id="displayName"
            v-model="form.display_name"
            type="text"
            class="form-control"
            required
          />
        </div>
        <div class="mb-3">
          <label for="emailAddress" class="form-label"
            >Email Kontak Squad</label
          >
          <input
            id="emailAddress"
            v-model="form.email_address"
            type="email"
            class="form-control"
            required
          />
        </div>

        <hr class="my-4" />

        <p class="text-muted">Pilih Lead dan Anggota (Opsional)</p>

        <div class="mb-3">
          <label for="leadSelector" class="form-label"
            >Calon Pemimpin (Lead)</label
          >
          <select
            id="leadSelector"
            v-model="form.lead_uuid"
            class="form-select"
            :disabled="availableUsers.length === 0"
          >
            <option :value="null">-- Tidak Dipilih --</option>
            <option
              v-for="user in availableUsers"
              :key="user.uuid"
              :value="user.uuid"
            >
              {{ user.display_name }}
            </option>
          </select>
          <div
            v-if="availableUsers.length === 0"
            class="form-text text-warning mt-1"
          >
            ⚠️ Semua pengguna sudah tergabung dalam squad lain.
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Calon Anggota</label>
          <div
            class="border rounded p-3"
            style="max-height: 200px; overflow-y: auto"
          >
            <template v-if="availableUsers.length > 0">
              <div
                v-for="user in availableUsers"
                :key="user.uuid"
                class="form-check"
              >
                <input
                  :id="`user-${user.uuid}`"
                  v-model="form.member_uuids"
                  :value="user.uuid"
                  class="form-check-input"
                  type="checkbox"
                />
                <label class="form-check-label" :for="`user-${user.uuid}`">
                  {{ user.display_name }}
                </label>
              </div>
            </template>
            <div
              v-else
              class="d-flex flex-column align-items-center justify-content-center text-center p-4 bg-light rounded"
            >
              <h6 class="text-muted fw-semibold">
                Tidak Ada User yang Tersedia
              </h6>
              <p class="text-muted small mb-0">
                Untuk menambahkan anggota, pastikan ada pengguna yang belum
                memiliki squad.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary mt-3"
          :disabled="isLoading"
        >
          {{ isLoading ? "Menyimpan..." : "Simpan Squad" }}
        </button>
      </form>
    </div>
  </div>
</template>
