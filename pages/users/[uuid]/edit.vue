<script lang="ts" setup>
import { ref, watchEffect } from "vue";
import { useUsers } from "~/composable/jira/useUser";
import { useSquads } from "~/composable/jira/useSquad";
import type { UpdateUserPayload } from "~/types/dto/jira-dto";
import type { JiraUserWithSquad } from "~/types/supabase-table";

// 1. Dapatkan UUID dari URL dan siapkan composables/state
const route = useRoute();
const router = useRouter();
const userId = route.params.uuid as string;

const { getUserById, updateUser } = useUsers();
const { getAllSquads } = useSquads();

// State untuk form
const form = ref<Partial<UpdateUserPayload>>({
  display_name: "",
  summary: "",
  email_address: "",
  description: "",
  squad_uuid: null,
});

// State untuk UI
const squads = ref<JiraUserWithSquad[]>([]);
const isLoading = ref(false);
const isSuccessModalVisible = ref(false);
const errorMessage = ref<string | null>(null);

// 2. Ambil data user dan daftar squad secara bersamaan
const { data, pending, error } = await useAsyncData(
  `user-edit-${userId}`,
  async () => {
    // Jalankan kedua fetch secara paralel untuk efisiensi
    const [userData, squadData] = await Promise.all([
      getUserById(userId),
      getAllSquads(),
    ]);
    return { user: userData, squads: squadData };
  },
);

// Tampilkan 404 jika user tidak ditemukan
if (!data.value?.user && !pending.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "User Jira tidak ditemukan",
    fatal: true,
  });
}

// 3. Isi form dan daftar squad saat data selesai dimuat
watchEffect(() => {
  if (data.value?.user) {
    const user = data.value.user;
    form.value.display_name = user.display_name;
    form.value.summary = user.summary;
    form.value.email_address = user.email_address;
    form.value.description = user.description;
    form.value.squad_uuid = user.squad_uuid;
  }
  if (data.value?.squads) {
    squads.value = data.value.squads;
  }
});

// 4. Fungsi untuk menutup modal dan kembali ke halaman detail
function closeModalAndReturnToDetail() {
  isSuccessModalVisible.value = false;
  router.push(`/users/${userId}`);
}

// 5. Fungsi untuk submit perubahan
async function handleSubmit() {
  isLoading.value = true;
  errorMessage.value = null;

  try {
    const payload: UpdateUserPayload = {
      uuid: userId,
      ...form.value,
    };

    const updatedUser = await updateUser(payload);

    if (updatedUser) {
      isSuccessModalVisible.value = true;
    } else {
      // Error ini mungkin tidak akan terjadi karena sudah ditangani di catch,
      // tapi sebagai jaga-jaga.
      throw new Error("Gagal mengupdate user.");
    }
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
      @close="closeModalAndReturnToDetail"
      @confirm="closeModalAndReturnToDetail"
      confirm-text="OK"
    >
      <template #header
        ><h5 class="fw-semibold mb-0 text-success">Berhasil!</h5></template
      >
      <template #default><p>Data user berhasil diperbarui.</p></template>
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
        <h3 class="fw-semibold mb-0">Edit User Jira</h3>
        <NuxtLink :to="`/users/${userId}`" class="btn btn-outline-secondary">
          &larr; Kembali ke Detail
        </NuxtLink>
      </div>

      <div v-if="pending" class="card-body text-center p-5">
        <div class="spinner-border" role="status"></div>
        <p class="mt-2 text-muted">Memuat data...</p>
      </div>

      <div v-else-if="error" class="card-body">
        <div class="alert alert-danger">Gagal memuat data.</div>
      </div>

      <div v-else class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="key" class="form-label">Key (Read-only)</label>
              <input
                :value="data?.user?.key"
                type="text"
                class="form-control"
                disabled
              />
            </div>
            <div class="col-md-6 mb-3">
              <label for="displayName" class="form-label">Display Name</label>
              <input
                id="displayName"
                v-model="form.display_name"
                type="text"
                class="form-control"
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
            <label for="squad" class="form-label">Alokasi Squad</label>
            <select id="squad" v-model="form.squad_uuid" class="form-select">
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
            {{ isLoading ? "Menyimpan..." : "Simpan Perubahan" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
