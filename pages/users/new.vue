<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useUsers } from "~/composable/jira/useUser";
import { useSquads } from "~/composable/jira/useSquad";
import type { NewUserPayload } from "~/types/dto/jira-dto";
import type { JiraSquad } from "~/types/supabase-table";

// 1. Siapkan semua state dan fungsi yang dibutuhkan
const router = useRouter();
const { createUser } = useUsers();
const { getAllSquads } = useSquads();

// State untuk form, dengan tipe dari DTO yang sudah kita buat
const form = ref<NewUserPayload>({
  key: "",
  summary: "",
  display_name: "",
  email_address: "",
  description: "",
  squad_uuid: null,
});

// State untuk UI
const squads = ref<JiraSquad[]>([]);
const isLoading = ref(false);
const isFetchingSquads = ref(true);

// State untuk modal feedback
const isSuccessModalVisible = ref(false);
const successMessage = ref("");
const errorMessage = ref<string | null>(null);

// 2. Ambil daftar squad saat halaman dimuat untuk mengisi dropdown
onMounted(async () => {
  isFetchingSquads.value = true;
  const squadList = await getAllSquads();
  if (squadList) {
    squads.value = squadList;
  }
  isFetchingSquads.value = false;
});

// 3. Fungsi untuk menutup modal dan redirect
function closeModalAndRedirect() {
  isSuccessModalVisible.value = false;
  router.push("/list-jira");
}

// 4. Fungsi untuk menangani submit form
async function handleSubmit() {
  isLoading.value = true;
  errorMessage.value = null;

  try {
    const newUser = await createUser(form.value);
    if (!newUser) {
      throw new Error("Gagal membuat user. Data yang dikembalikan kosong.");
    }

    // Tampilkan modal sukses
    successMessage.value = `User Jira "${newUser.display_name}" berhasil dibuat.`;
    isSuccessModalVisible.value = true;
  } catch (error: any) {
    errorMessage.value =
      error.data?.statusMessage || error.message || "Terjadi kesalahan.";
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div>
    <AppModal
      :show="isSuccessModalVisible"
      confirm-text="OK"
      @close="closeModalAndRedirect"
      @confirm="closeModalAndRedirect"
    >
      <template #header
        ><h5 class="fw-semibold mb-0 text-success">Berhasil!</h5></template
      >
      <template #default
        ><p>{{ successMessage }}</p></template
      >
    </AppModal>

    <AppModal
      :show="!!errorMessage"
      confirm-button-type="secondary"
      confirm-text="Tutup"
      @close="errorMessage = null"
    >
      <template #header
        ><h5 class="fw-semibold mb-0 text-danger">
          Terjadi Kesalahan
        </h5></template
      >
      <template #default
        ><p>{{ errorMessage }}</p></template
      >
    </AppModal>

    <div class="card border-0 shadow-sm">
      <div
        class="card-header bg-white py-4 d-flex align-items-center justify-content-between"
      >
        <h3 class="fw-semibold mb-0">Tambah User Jira Baru</h3>
        <NuxtLink class="btn btn-outline-secondary" to="/users">
          &larr; Kembali ke List
        </NuxtLink>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="key">Key</label>
              <input
                id="key"
                v-model="form.key"
                class="form-control"
                placeholder="Contoh: ITBOA-12345"
                required
                type="text"
              />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="displayName">Display Name</label>
              <input
                id="displayName"
                v-model="form.display_name"
                class="form-control"
                placeholder="Contoh: BOA - Nama Lengkap"
                required
                type="text"
              />
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label" for="summary">Summary</label>
            <input
              id="summary"
              v-model="form.summary"
              class="form-control"
              placeholder="Contoh: Nama Lengkap - NIP"
              required
              type="text"
            />
          </div>

          <div class="mb-3">
            <label class="form-label" for="emailAddress">Email Address</label>
            <input
              id="emailAddress"
              v-model="form.email_address"
              class="form-control"
              required
              type="email"
            />
          </div>

          <div class="mb-3">
            <label class="form-label" for="squad"
              >Alokasi ke Squad (Opsional)</label
            >
            <div v-if="isFetchingSquads" class="text-muted small">
              Memuat daftar squad...
            </div>
            <select
              v-else
              id="squad"
              v-model="form.squad_uuid"
              class="form-select"
            >
              <option :value="null">-- Tidak Dialokasikan --</option>
              <option
                v-for="squad in squads"
                :key="squad.uuid"
                :value="squad.uuid"
              >
                {{ squad.display_name }}
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label" for="description"
              >Deskripsi (Opsional)</label
            >
            <textarea
              id="description"
              v-model="form.description"
              class="form-control"
              rows="3"
            ></textarea>
          </div>

          <button
            :disabled="isLoading"
            class="btn btn-primary mt-3"
            type="submit"
          >
            {{ isLoading ? "Menyimpan..." : "Simpan User Jira" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
