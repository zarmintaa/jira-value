<script lang="ts" setup>
import { ref, computed, watchEffect } from "vue";
import { useUsers } from "~/composable/jira/useUser";
import { useSquads } from "~/composable/jira/useSquad";
import type { JiraUserBasicInfo } from "~/types/supabase-table";
import type { JiraSquadWithDetails } from "~/types/JiraSquad";

// 1. Dapatkan data awal dan siapkan state
const route = useRoute();
const router = useRouter();
const squadId = route.params.uuid as string;

const { getSquadById } = useSquads();
const { getAvailableUsers } = useUsers();

const form = ref({
  display_name: "",
  email_address: "",
  lead_uuid: null as string | null,
  member_uuids: [] as string[],
});

// State untuk menyimpan daftar anggota awal
const initialMemberUuids = ref<string[]>([]);
const availableUsers = ref<JiraUserBasicInfo[]>([]);
const isLoading = ref(false);

// State baru untuk modal (seperti di halaman /new)
const isSuccessModalVisible = ref(false);
const successMessage = ref("");
const errorMessage = ref<string | null>(null);

// 2. Ambil data squad dan data user yang tersedia secara bersamaan
const { data: squadData, pending } =
  await useAsyncData<JiraSquadWithDetails | null>(
    `squad-edit-data-${squadId}`,
    () => getSquadById(squadId),
  );

const { data: availableUsersData } = await useAsyncData<JiraUserBasicInfo[]>(
  "available-users-for-edit",
  () => getAvailableUsers(),
);

// Fungsi baru untuk menutup modal dan kembali ke halaman detail
function closeModalAndReturn() {
  isSuccessModalVisible.value = false;
  // Kembali ke halaman detail untuk melihat perubahan
  router.push(`/squads/${squadId}`);
}

// 3. Isi form dan daftar user saat data selesai diambil
watchEffect(() => {
  if (squadData.value) {
    form.value.display_name = squadData.value.display_name;
    form.value.email_address = squadData.value.email_address;
    form.value.lead_uuid = squadData.value.lead?.uuid ?? null;

    const currentMemberUuids = squadData.value.jira_users.map((u) => u.uuid);
    form.value.member_uuids = currentMemberUuids;
    initialMemberUuids.value = [...currentMemberUuids]; // Simpan state awal
  }
  if (availableUsersData.value) {
    availableUsers.value = availableUsersData.value;
  }
});

// 4. Gabungkan daftar anggota saat ini dengan user yang tersedia untuk ditampilkan di form
const selectableUsers = computed(() => {
  const currentMembers = squadData.value?.jira_users || [];
  return (
    [...currentMembers, ...availableUsers.value]
      // Hapus duplikat jika ada
      .filter(
        (user, index, self) =>
          index === self.findIndex((u) => u.uuid === user.uuid),
      )
      .sort((a, b) => a.display_name.localeCompare(b.display_name))
  );
});

// 5. Logika saat submit
// Modifikasi fungsi handleSubmit
async function handleSubmit() {
  isLoading.value = true;
  errorMessage.value = null; // Reset error message
  try {
    const members_to_add = form.value.member_uuids.filter(
      (uuid) => !initialMemberUuids.value.includes(uuid),
    );
    const members_to_remove = initialMemberUuids.value.filter(
      (uuid) => !form.value.member_uuids.includes(uuid),
    );

    // Panggil API endpoint untuk update (sekarang kita ganti namanya menjadi _updateSquad)
    await $fetch("/api/squads/update-details", {
      method: "PUT",
      body: {
        uuid: squadId,
        display_name: form.value.display_name,
        email_address: form.value.email_address,
        lead_uuid: form.value.lead_uuid,
        members_to_add,
        members_to_remove,
      },
    });

    // Hapus alert() dan ganti dengan menampilkan modal
    successMessage.value = "Data squad berhasil diperbarui!";
    isSuccessModalVisible.value = true;
  } catch (error: any) {
    // Tampilkan error di UI, bukan alert
    errorMessage.value = error.data?.statusMessage || "Gagal mengupdate squad";
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div>
    <AppModal :show="isSuccessModalVisible" @close="closeModalAndReturn">
      <template #header>
        <h5 class="fw-semibold mb-0">Berhasil!</h5>
      </template>
      <template #default>
        <p>{{ successMessage }}</p>
      </template>
      <template #footer>
        <button class="btn btn-primary" @click="closeModalAndReturn">
          Kembali ke Detail
        </button>
      </template>
    </AppModal>

    <AppModal :show="!!errorMessage" @close="errorMessage = null">
      <template #header>
        <h5 class="fw-semibold mb-0 text-danger">Terjadi Kesalahan</h5>
      </template>
      <template #default>
        <p>{{ errorMessage }}</p>
      </template>
      <template #footer>
        <button class="btn btn-secondary" @close="errorMessage = null">
          Tutup
        </button>
      </template>
    </AppModal>
  </div>
  <div class="card border-0 shadow-sm">
    <div class="card-header bg-white py-4">
      <h3 class="fw-semibold mb-0">Edit Squad</h3>
    </div>
    <div class="card-body">
      <div v-if="pending" class="text-center p-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">Memuat data squad...</p>
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
        <p class="text-muted">Edit Pemimpin dan Anggota</p>

        <div class="mb-3">
          <label for="leadSelector" class="form-label">Pemimpin (Lead)</label>
          <select
            id="leadSelector"
            v-model="form.lead_uuid"
            class="form-select"
          >
            <option :value="null">-- Tidak Dipilih --</option>
            <option
              v-for="user in selectableUsers"
              :key="user.uuid"
              :value="user.uuid"
            >
              {{ user.display_name }}
            </option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Anggota</label>
          <div
            class="border rounded p-3"
            style="max-height: 200px; overflow-y: auto"
          >
            <div
              v-for="user in selectableUsers"
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
              <label class="form-check-label" :for="`user-${user.uuid}`">{{
                user.display_name
              }}</label>
            </div>
          </div>
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
</template>
