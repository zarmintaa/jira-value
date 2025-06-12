<script lang="ts" setup>
import CardRank from "~/components/rank/CardRank.vue";
import RankCardSkeleton from "~/components/rank/RankCardSkeleton.vue";
import type { Ref } from "vue";
import type { JiraIssue, JiraUser } from "~/types/jira.js";
import { ref, onUnmounted } from "vue";
import { dummyJiraUser } from "~/data/dummy-jira.js";

// --- STATE MANAGEMENT ---
const startDate = ref("");
const endDate = ref("");
const hasFiltered = ref(false);
const sourceUsers: Ref<JiraUser[]> = ref(dummyJiraUser || []);
let controller: AbortController | null = null;

// --- STATE MANUAL (PENGGANTI useAsyncData) ---
const rankedUsersData = ref<any[] | null>(null);
const pending = ref(false); // Menggantikan isLoading & pending dari useAsyncData
const error = ref<Error | null>(null); // Untuk menyimpan error secara lokal (opsional)

// Definisikan konstanta ikon (tidak berubah)
const ICON_CLOCK = "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z";
const ICON_STAR =
  "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.sem563 0 00.475-.345L11.48 3.5z";
const ICON_SUBTASK =
  "M3 13h2V3H3v10zm4 0h2V6H7v7zm4 0h2V8h-2v5zm4 0h2V1h-2v12z";

// --- LOGIC ---
// Fungsi getRank tidak perlu diubah.
// $fetch di dalamnya secara otomatis akan melempar error jika gagal.
const getRank = async (filterStartDate: string, filterEndDate: string) => {
  controller = new AbortController();
  const signal = controller.signal;

  if (sourceUsers.value.length === 0) return [];

  const userMap = new Map(sourceUsers.value.map((user) => [user.key, user]));

  const parentFetchPromises = sourceUsers.value.map((user) =>
    $fetch<JiraIssue>(`/api/jira/${user.key}`, { signal }),
  );
  const jiraIssues = await Promise.all(parentFetchPromises);
  const subtaskFetchPromises = jiraIssues.flatMap((issue) =>
    (issue.fields.subtasks || []).map((subtask) =>
      $fetch<JiraIssue>(`/api/jira/${subtask.key}`, { signal }),
    ),
  );
  const allFetchedSubtasks: JiraIssue[] =
    subtaskFetchPromises.length > 0
      ? await Promise.all(subtaskFetchPromises)
      : [];
  const subtasksByParentKey = new Map<string, JiraIssue[]>();
  for (const subtask of allFetchedSubtasks) {
    const parentKey = subtask.fields.parent?.key;
    if (parentKey) {
      if (!subtasksByParentKey.has(parentKey))
        subtasksByParentKey.set(parentKey, []);
      subtasksByParentKey.get(parentKey)!.push(subtask);
    }
  }
  const enrichedJiraIssues: JiraIssue[] = jiraIssues.map((parentIssue) => ({
    ...parentIssue,
    fields: {
      ...parentIssue.fields,
      subtasks: subtasksByParentKey.get(parentIssue.key) || [],
    },
  }));

  const processedData = enrichedJiraIssues
    .map((enrichedIssue) => {
      const filteredSubtasks = enrichedIssue.fields.subtasks.filter((st) => {
        const createdDate = st.fields.created.slice(0, 10);
        return createdDate >= filterStartDate && createdDate <= filterEndDate;
      });

      if (filteredSubtasks.length === 0) {
        return null;
      }

      const uniqueActiveDays = new Set(
        filteredSubtasks.map((st) => st.fields.created.slice(0, 10)),
      ).size;

      const totalTimeInSeconds = filteredSubtasks.reduce(
        (total, subtask) => total + (subtask.fields.timeestimate || 0),
        0,
      );
      const subtasksDone = filteredSubtasks.filter(
        (st) => st.fields.status.name === "Done",
      ).length;
      const totalSubtasks = filteredSubtasks.length;
      const doneRatio = totalSubtasks > 0 ? subtasksDone / totalSubtasks : 0;

      const totalHoursFormatted = `${(totalTimeInSeconds / 3600).toFixed(1)}h`;
      const originalUser = userMap.get(enrichedIssue.key);

      return {
        user: {
          name: originalUser?.displayName || "Unknown User",
          email: originalUser?.emailAddress || "",
          avatar: enrichedIssue?.fields?.assignee?.avatarUrls["48x48"] || "",
        },
        stats: [
          { label: "Total Point", value: uniqueActiveDays, icon: ICON_STAR },
          {
            label: "Subtask Est. Time",
            value: totalHoursFormatted,
            icon: ICON_CLOCK,
          },
          {
            label: "Subtasks Done",
            value: `${subtasksDone} / ${totalSubtasks}`,
            icon: ICON_SUBTASK,
          },
        ],
        sortable: {
          points: uniqueActiveDays,
          time: totalTimeInSeconds,
          ratio: doneRatio,
        },
      };
    })
    .filter((item) => item !== null) as any[];

  processedData.sort((a, b) => {
    const pointDiff = b.sortable.points - a.sortable.points;
    if (pointDiff !== 0) return pointDiff;
    const timeDiff = b.sortable.time - a.sortable.time;
    if (timeDiff !== 0) return timeDiff;
    return b.sortable.ratio - a.sortable.ratio;
  });

  const finalData = processedData.map((item, index) => {
    const { sortable, ...rest } = item;
    return {
      ...rest,
      rank: index + 1,
    };
  });

  return finalData;
};

// --- EXECUTION ---
// ** Hapus blok useAsyncData **

const handleFilter = async () => {
  if (!startDate.value || !endDate.value) {
    alert("Silakan isi tanggal mulai dan tanggal selesai.");
    return;
  }

  hasFiltered.value = true;
  pending.value = true;
  error.value = null;

  try {
    // Panggil getRank secara langsung dan simpan hasilnya
    const result = await getRank(startDate.value, endDate.value);
    rankedUsersData.value = result;
  } catch (err: any) {
    // Tangkap error dari $fetch
    error.value = err; // Simpan error jika perlu ditampilkan lokal

    // ** Inilah kuncinya: Panggil showError untuk memicu handler global **
    showError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || "Gagal Mengambil Data Peringkat",
      message: err.message,
    });
  } finally {
    // Selalu pastikan loading berhenti
    pending.value = false;
  }
};

onUnmounted(() => {
  if (controller) {
    controller.abort();
  }
});
</script>

<template>
  <div>
    <div class="card shadow-sm mb-4">
      <div class="card-header bg-white mb-0">
        <h5 class="card-title">Filter Peringkat</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleFilter">
          <div class="row g-3 align-items-end">
            <div class="col-md">
              <label for="startDate" class="form-label">Tanggal Mulai</label>
              <input
                id="startDate"
                v-model="startDate"
                type="date"
                class="form-control"
                required
              />
            </div>
            <div class="col-md">
              <label for="endDate" class="form-label">Tanggal Selesai</label>
              <input
                id="endDate"
                v-model="endDate"
                type="date"
                class="form-control"
                required
              />
            </div>
            <div class="col-md-auto">
              <button
                type="submit"
                class="btn btn-primary w-100"
                :disabled="pending"
              >
                <span
                  v-if="pending"
                  class="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span v-else>Generate Rank</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div v-if="hasFiltered">
      <div v-if="pending" class="row g-4">
        <div v-for="n in 6" :key="`skel-${n}`" class="col-lg-6 col-sm-12">
          <RankCardSkeleton />
        </div>
      </div>

      <div
        v-else-if="rankedUsersData && rankedUsersData.length > 0"
        class="row g-4"
      >
        <div
          v-for="(item, index) in rankedUsersData"
          :key="item.rank"
          :style="{ 'animation-delay': `${index * 100}ms` }"
          class="col-lg-6 col-sm-12 fade-in"
        >
          <CardRank
            :rank="item.rank"
            :stats="item.stats"
            :user="item.user"
            :class="`is-rank-${item.rank}`"
          />
        </div>
      </div>

      <div v-else-if="!pending" class="text-center p-5 bg-light rounded">
        <h5>Tidak Ada Data</h5>
        <p class="text-muted">
          Tidak ada aktivitas yang tercatat pada rentang tanggal yang dipilih.
        </p>
      </div>
    </div>

    <div v-else class="text-center p-5 bg-light rounded">
      <h5>Selamat Datang</h5>
      <p class="text-muted">
        Silakan pilih rentang tanggal dan klik "Generate Rank" untuk melihat
        peringkat.
      </p>
    </div>
  </div>
</template>

<style scoped>
.fade-in {
  animation: fadeIn 0.5s ease-in-out forwards;
  opacity: 0;
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
