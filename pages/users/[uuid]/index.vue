<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useUsers } from '~/composable/jira/useUser';
import { formatReadableDate } from '~/utils/day';
// Asumsikan nama modal Anda adalah AppModal dan sudah bisa diakses secara global
// import AppModal from '~/components/global/AppModal.vue';

// 1. Dapatkan UUID dari URL, siapkan composables dan state
const route = useRoute();
const router = useRouter();
const userId = route.params.uuid as string;

const { getUserById, deleteUser } = useUsers();

// State untuk modal konfirmasi dan feedback
const isDeleteModalVisible = ref(false);
const isSuccessModalVisible = ref(false); // Untuk modal sukses setelah delete
const errorMessage = ref<string | null>(null); // Untuk modal error
const isDeleting = ref(false);

// 2. Ambil data detail user dari Supabase
const { data: user, pending, error } = await useAsyncData(
  `user-detail-${userId}`,
  () => getUserById(userId)
);

// Tampilkan halaman 404 jika user tidak ditemukan
if (!user.value && !pending.value) {
  throw createError({ statusCode: 404, statusMessage: 'User Jira tidak ditemukan', fatal: true });
}

// 3. Fungsi untuk menutup modal sukses dan kembali ke halaman list
function closeSuccessModalAndRedirect() {
  isSuccessModalVisible.value = false;
  router.push('/users'); // Arahkan ke halaman daftar user
}

// 4. Fungsi untuk menghapus user
async function handleDeleteUser() {
  if (!user.value) return;

  isDeleting.value = true;
  errorMessage.value = null;

  const success = await deleteUser(user.value.uuid);

  isDeleteModalVisible.value = false;

  if (success) {
    // Tampilkan modal sukses
    isSuccessModalVisible.value = true;
  } else {
    errorMessage.value = "Gagal menghapus user. Silakan coba lagi.";
  }

  isDeleting.value = false;
}
</script>

<template>
  <div>
    <AppModal
      :show="isDeleteModalVisible"
      @close="isDeleteModalVisible = false"
      @confirm="handleDeleteUser"
      confirm-text="Ya, Hapus"
      cancel-text="Batal"
      confirm-button-type="danger"
    >
      <template #header><h5 class="fw-semibold mb-0">Konfirmasi Hapus User</h5></template>
      <template #default>
        <p>Apakah Anda yakin ingin menghapus user <strong>"{{ user?.display_name }}"</strong>?</p>
        <p class="text-danger small">Tindakan ini tidak dapat dibatalkan.</p>
      </template>
    </AppModal>

    <AppModal :show="isSuccessModalVisible" @close="closeSuccessModalAndRedirect" @confirm="closeSuccessModalAndRedirect" confirm-text="OK">
      <template #header><h5 class="fw-semibold mb-0 text-success">Berhasil!</h5></template>
      <template #default><p>User Jira telah berhasil dihapus.</p></template>
    </AppModal>

    <AppModal :show="!!errorMessage" @close="errorMessage = null" confirm-text="Tutup" confirm-button-type="secondary">
      <template #header><h5 class="fw-semibold mb-0 text-danger">Terjadi Kesalahan</h5></template>
      <template #default><p>{{ errorMessage }}</p></template>
    </AppModal>

    <div v-if="pending" class="text-center p-5">
      <div class="spinner-border" role="status"></div>
      <p class="mt-2 text-muted">Memuat detail user...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      Gagal memuat data: {{ error.message }}
    </div>

    <div v-else-if="user">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h3 class="fw-semibold mb-0">{{ user.display_name }}</h3>
            <p class="text-muted mb-0">{{ user.key }}</p>
          </div>
          <div class="d-flex gap-2">
            <NuxtLink :to="`/users/${userId}/edit`" class="btn btn-secondary">
              Edit
            </NuxtLink>
            <button class="btn btn-danger" @click="isDeleteModalVisible = true">
              Delete
            </button>
          </div>
        </div>
        <div class="card-body p-4">
          <dl class="row">
            <dt class="col-sm-3 text-muted">Summary:</dt>
            <dd class="col-sm-9">{{ user.summary }}</dd>

            <dt class="col-sm-3 text-muted">Email:</dt>
            <dd class="col-sm-9">{{ user.email_address }}</dd>

            <dt class="col-sm-3 text-muted">Deskripsi:</dt>
            <dd class="col-sm-9">{{ user.description || '-' }}</dd>

            <hr class="my-3">

            <dt class="col-sm-3 text-muted">Squad:</dt>
            <dd class="col-sm-9">{{ user.jira_squads?.display_name ?? 'Tidak teralokasi' }}</dd>

            <dt class="col-sm-3 text-muted">Dibuat pada:</dt>
            <dd class="col-sm-9">{{ formatReadableDate(user.created_at) }}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>