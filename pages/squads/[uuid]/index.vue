<script lang="ts" setup>
import { computed, ref } from "vue";
import { useSquads } from "~/composable/jira/useSquad";
import TableView from "~/components/table/TableView.vue";
import { formatReadableDate } from "~/utils/day";

// 1. Hapus import 'useNotification'
// import { useNotification } from '~/composables/useNotification';

const route = useRoute();
const router = useRouter();
const squadId = route.params.uuid as string;

const { getSquadById, deleteSquad } = useSquads();
// Hapus pemanggilan useNotification
// const { showNotification } = useNotification();

// 2. Siapkan state untuk KEDUA modal
const isDeleteModalVisible = ref(false); // Untuk modal konfirmasi
const isSuccessModalVisible = ref(false); // Untuk modal sukses
const isDeleting = ref(false);
const errorMessage = ref<string | null>(null); // Untuk modal error

// FUNGSI BARU: Dipanggil saat modal sukses ditutup
function closeModalAndRedirect() {
  isSuccessModalVisible.value = false;
  // Redirect terjadi di sini
  router.push("/squads");
}
// ... (sisa kode `useAsyncData`, `computed`, `getInitials` tetap sama) ...
const {
  data: squad,
  pending,
  error,
} = await useAsyncData(`squad-detail-${squadId}`, () => getSquadById(squadId));

if (!squad.value && !pending.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Squad tidak ditemukan",
    fatal: true,
  });
}

const memberItems = computed(() => {
  if (!squad.value?.jira_users) return [];
  return squad.value.jira_users.map((member) => ({
    key: member.key,
    nama: member.display_name,
  }));
});

const memberKeys = computed(() => Object.keys(memberItems.value[0] || {}));
const memberHeaders = computed(() =>
  memberKeys.value.map((key) => key.charAt(0).toUpperCase() + key.slice(1)),
);

const getInitials = (name: string | undefined): string => {
  if (!name) return "?";
  const names = name.split(" ");
  return names
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};
// =======================================================================

// 3. Buat fungsi baru untuk menutup modal sukses dan redirect
function closeSuccessModalAndRedirect() {
  isSuccessModalVisible.value = false;
  router.push("/squads");
}

// 4. Perbarui fungsi handleDeleteSquad
async function handleDeleteSquad() {
  isDeleting.value = true;
  errorMessage.value = null;

  const success = await deleteSquad(squadId);

  isDeleteModalVisible.value = false; // Tutup modal konfirmasi

  if (success) {
    // Jika berhasil, JANGAN langsung redirect. Tampilkan modal sukses.
    isSuccessModalVisible.value = true;
  } else {
    errorMessage.value = "Gagal menghapus squad. Silakan coba lagi.";
  }

  isDeleting.value = false;
}
</script>

<template>
  <div>
    <AppModal
      :show="isDeleteModalVisible"
      @close="isDeleteModalVisible = false"
      @confirm="handleDeleteSquad"
      confirm-text="Ya, Hapus"
      cancel-text="Batal"
      confirm-button-type="danger"
    >
      <template #header>
        <h5 class="fw-semibold mb-0">Konfirmasi Hapus Squad</h5>
      </template>
      <template #default>
        <p>
          Apakah Anda yakin ingin menghapus squad
          <strong>"{{ squad?.display_name }}"</strong>?
        </p>
      </template>
    </AppModal>

    <AppModal
      :show="isSuccessModalVisible"
      @close="closeModalAndRedirect"
      @confirm="closeModalAndRedirect"
      confirm-text="OK"
    >
      <template #header>
        <h5 class="fw-semibold mb-0 text-success">Berhasil!</h5>
      </template>
      <template #default>
        <p>Squad telah berhasil dihapus.</p>
      </template>
    </AppModal>

    <AppModal
      :show="!!errorMessage"
      @close="errorMessage = null"
      confirm-text="Tutup"
    >
      <template #header>
        <h5 class="fw-semibold mb-0 text-danger">Terjadi Kesalahan</h5>
      </template>
      <template #default>
        <p>{{ errorMessage }}</p>
      </template>
    </AppModal>

    <!--    <DebugModal
      :show="isDeleteModalVisible"
      @close="isDeleteModalVisible = false"
      @confirm="handleDeleteSquad"
    />-->
  </div>
  <div v-if="pending" class="text-center p-5">
    <div class="spinner-border" role="status"></div>
    <p class="mt-2 text-muted">Memuat detail squad...</p>
  </div>

  <div v-else-if="error" class="alert alert-danger">
    Gagal memuat data: {{ error.message }}
  </div>

  <div v-else-if="squad">
    <div class="card border-0 shadow-sm mb-4">
      <div
        class="card-header bg-white py-4 d-flex align-items-center justify-content-between flex-wrap gap-2"
      >
        <h3 class="fw-semibold mb-0">Detail Squad</h3>
        <div class="d-flex gap-2">
          <NuxtLink :to="`/squads/${squadId}/edit`" class="btn btn-secondary">
            Edit
          </NuxtLink>
          <button class="btn btn-danger" @click="isDeleteModalVisible = true">
            Delete
          </button>
        </div>
      </div>
      <div class="card-body p-4">
        <h4 class="fw-bold mb-4 border-bottom pb-3">
          {{ squad.display_name }}
        </h4>

        <div class="row">
          <div class="col-lg-7">
            <dl class="row">
              <dt class="col-sm-5 col-md-4 text-muted">Email Kontak:</dt>
              <dd class="col-sm-7 col-md-8">{{ squad.email_address }}</dd>

              <dt class="col-sm-5 col-md-4 text-muted">Dibuat pada:</dt>
              <dd class="col-sm-7 col-md-8">
                {{ formatReadableDate(squad.created_at) }}
              </dd>

              <template v-if="squad.updated_at > squad.created_at">
                <dt class="col-sm-5 col-md-4 text-muted">Di-update pada:</dt>
                <dd class="col-sm-7 col-md-8">
                  {{ formatReadableDate(squad.updated_at) }}
                </dd>
              </template>
            </dl>
          </div>

          <div class="col-lg-5 mt-4 mt-lg-0 ps-lg-4 border-start-lg">
            <h6 class="text-muted fw-semibold mb-3">Pemimpin Squad (Lead)</h6>

            <div v-if="squad.lead" class="d-flex align-items-center gap-3">
              <div
                class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                style="width: 48px; height: 48px; font-size: 1.2rem"
              >
                {{ getInitials(squad.lead.display_name) }}
              </div>
              <div>
                <div class="fw-semibold">{{ squad.lead.display_name }}</div>
                <div class="text-muted small">{{ squad.lead.key }}</div>
              </div>
            </div>

            <div v-else class="text-muted fst-italic">Belum Ditentukan</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white py-4">
        <h4 class="fw-semibold mb-0">
          Anggota Squad ({{ squad.jira_users.length }})
        </h4>
      </div>
      <div class="card-body">
        <TableView
          :items="memberItems"
          :tHeader="memberHeaders"
          :tKey="memberKeys"
          :itemsPerPage="10"
        />
      </div>
    </div>
  </div>
</template>
