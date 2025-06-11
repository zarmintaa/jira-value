<script lang="ts" setup>
import CardRank from "~/components/rank/CardRank.vue";
import type { Ref } from "vue";
import type { JiraIssue, JiraUser } from "~/types/jira.js";
import { ref, onUnmounted } from "vue";
import { dummyJiraUser } from "~/data/dummy-jira.js";

// Definisikan konstanta ikon untuk kebersihan kode
const ICON_CLOCK = "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z";
const ICON_STAR =
  "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.sem563 0 00.475-.345L11.48 3.5z";
const ICON_SUBTASK =
  "M3 13h2V3H3v10zm4 0h2V6H7v7zm4 0h2V8h-2v5zm4 0h2V1h-2v12z";

// --- STATE MANAGEMENT ---
const sourceUsers: Ref<JiraUser[]> = ref(dummyJiraUser || []);
let controller: AbortController | null = null;

// --- LOGIC ---
// Fungsi ini sekarang tidak mengubah state apa pun, ia hanya fokus mengambil dan memproses data, lalu mengembalikannya.
const getRank = async () => {
  controller = new AbortController();
  const signal = controller.signal;

  if (sourceUsers.value.length === 0) return [];

  // 1. Fetch parents
  const parentFetchPromises = sourceUsers.value.map((user) =>
    $fetch<JiraIssue>(`/api/jira/${user.key}`, { signal }),
  );
  const jiraIssues = await Promise.all(parentFetchPromises);

  // 2. Fetch subtasks
  const subtaskFetchPromises = jiraIssues.flatMap((issue) =>
    (issue.fields.subtasks || []).map((subtask) =>
      $fetch<JiraIssue>(`/api/jira/${subtask.key}`, { signal }),
    ),
  );
  const allFetchedSubtasks: JiraIssue[] =
    subtaskFetchPromises.length > 0
      ? await Promise.all(subtaskFetchPromises)
      : [];

  // 3. Group subtasks
  const subtasksByParentKey = new Map<string, JiraIssue[]>();
  for (const subtask of allFetchedSubtasks) {
    const parentKey = subtask.fields.parent?.key;
    if (parentKey) {
      if (!subtasksByParentKey.has(parentKey))
        subtasksByParentKey.set(parentKey, []);
      subtasksByParentKey.get(parentKey)!.push(subtask);
    }
  }

  // 4. Enrich parents with full subtask data
  const enrichedJiraIssues: JiraIssue[] = jiraIssues.map((parentIssue) => ({
    ...parentIssue,
    fields: {
      ...parentIssue.fields,
      subtasks: subtasksByParentKey.get(parentIssue.key) || [],
    },
  }));

  // 5. Proses data final
  const finalData = enrichedJiraIssues.map((enrichedIssue, index) => {
    const originalUser = sourceUsers.value.find(
      (u) => u.key === enrichedIssue.key,
    );

    const allCreationTimestamps = [
      enrichedIssue.fields.created,
      ...enrichedIssue.fields.subtasks.map((st) => st.fields.created),
    ];
    const allDateStrings = allCreationTimestamps
      .filter((ts) => ts)
      .map((ts) => ts.slice(0, 10));
    const uniqueDayCount = new Set(allDateStrings).size;

    const totalTimeInSeconds = enrichedIssue.fields.subtasks.reduce(
      (total, subtask) => total + (subtask.fields.timeestimate || 0),
      0,
    );
    const totalHoursFormatted = `${(totalTimeInSeconds / 3600).toFixed(1)}h`;

    const subtasksDone = enrichedIssue.fields.subtasks.filter(
      (st) => st.fields.status.name === "Done",
    ).length;

    return {
      rank: index + 1,
      user: {
        name: originalUser?.name || "Unknown User",
        email: originalUser?.emailAddresses[0] || "",
        avatar: originalUser?.avatarUrls["48x48"] || "",
      },
      stats: [
        { label: "Total Point", value: uniqueDayCount, icon: ICON_STAR },
        {
          label: "Subtask Est. Time",
          value: totalHoursFormatted,
          icon: ICON_CLOCK,
        },
        {
          label: "Subtasks Done",
          value: `${subtasksDone} / ${enrichedIssue.fields.subtasks.length}`,
          icon: ICON_SUBTASK,
        },
      ],
    };
  });

  // PENTING: Kembalikan data yang sudah diproses
  return finalData;
};

// --- LIFECYCLE & EXECUTION ---
// Panggil `getRank` di dalam `useAsyncData` dengan opsi `lazy: true`
// Nuxt akan secara otomatis mengelola state `pending`, `error`, dan `data`
const {
  data: rankedUsersData,
  pending,
  error,
} = await useAsyncData(
  "get-user-ranks", // Kunci unik untuk data ini
  () => getRank(), // Fungsi yang akan dijalankan
  { lazy: true }, // <-- Tidak memblokir render di server
);

onUnmounted(() => {
  // Batalkan fetch jika user meninggalkan halaman sebelum selesai
  if (controller) {
    controller.abort();
  }
});
</script>

<template>
  <div class="mt-3">
    <div v-if="pending" class="row g-4">
      <div v-for="n in 4" :key="`skel-${n}`" class="col-lg-6 col-sm-12">
        <div class="card shadow-sm">
          <div class="card-body d-flex align-items-center p-3">
            <div class="skeleton-avatar me-3"></div>
            <div class="flex-grow-1">
              <div class="skeleton-text w-75 mb-2"></div>
              <div class="skeleton-text w-50"></div>
            </div>
            <div class="skeleton-rank"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      Gagal memuat data peringkat. Silakan coba lagi nanti.
      <pre class="mt-2">{{ error.message }}</pre>
    </div>

    <div v-else class="row g-4">
      <div
        v-for="(item, index) in rankedUsersData"
        :key="item.rank"
        :style="{ 'animation-delay': `${index * 100}ms` }"
        class="col-lg-6 col-sm-12 fade-in"
      >
        <CardRank :rank="item.rank" :stats="item.stats" :user="item.user" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* CSS untuk Skeleton Loader */
.skeleton-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #eef0f2;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-text {
  height: 1rem;
  background-color: #eef0f2;
  border-radius: 4px;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-rank {
  width: 30px;
  height: 30px;
  background-color: #eef0f2;
  border-radius: 4px;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.w-75 {
  width: 75%;
}
.w-50 {
  width: 50%;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* CSS untuk animasi fade-in setelah data dimuat */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
