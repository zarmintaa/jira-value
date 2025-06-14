<script lang="ts" setup>
import { ref, onMounted } from "vue";
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
      @close="closeModalAndRedirect"
      @confirm="closeModalAndRedirect"
      confirm-text="OK"
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
      @close="errorMessage = null"
      confirm-text="Tutup"
      confirm-button-type="secondary"
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
        <NuxtLink to="/users" class="btn btn-outline-secondary">
          &larr; Kembali ke List
        </NuxtLink>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="key" class="form-label">Key</label>
              <input
                id="key"
                v-model="form.key"
                type="text"
                class="form-control"
                placeholder="Contoh: ITBOA-12345"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label for="displayName" class="form-label">Display Name</label>
              <input
                id="displayName"
                v-model="form.display_name"
                type="text"
                class="form-control"
                placeholder="Contoh: BOA - Nama Lengkap"
                required
              />
            </div>
          </div>

          <div class="mb-3">
            <label for="summary" class="form-label">Summary</label>
            <input
              id="summary"
              v-model="form.summary"
              type="text"
              class="form-control"
              placeholder="Contoh: Nama Lengkap - NIP"
              required
            />
          </div>

          <div class="mb-3">
            <label for="emailAddress" class="form-label">Email Address</label>
            <input
              id="emailAddress"
              v-model="form.email_address"
              type="email"
              class="form-control"
              required
            />
          </div>

          <div class="mb-3">
            <label for="squad" class="form-label"
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
            <label for="description" class="form-label"
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
            type="submit"
            class="btn btn-primary mt-3"
            :disabled="isLoading"
          >
            {{ isLoading ? "Menyimpan..." : "Simpan User Jira" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
