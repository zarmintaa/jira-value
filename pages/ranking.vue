<script lang="ts" setup>
import CardRank from "~/components/rank/CardRank.vue";
import RankCardSkeleton from "~/components/rank/RankCardSkeleton.vue";
import type { Ref } from "vue";
import type { JiraIssue, JiraUser } from "~/types/jira.js";
import { ref, onUnmounted } from "vue";
import { dummyJiraUser } from "~/data/dummy-jira.js";
import { useErrorStore } from "~/stores/error-store";
import { gsap } from "gsap";

// --- STATE MANAGEMENT ---
const startDate = ref("");
const endDate = ref("");
const hasFiltered = ref(false);
const sourceUsers: Ref<JiraUser[]> = ref(dummyJiraUser || []);
let controller: AbortController | null = null;
const rankedUsersData = ref<any[] | null>(null);
const pending = ref(false);
const errorStore = useErrorStore();
const rankListContainer = ref<HTMLDivElement | null>(null); // <-- 2. Ref untuk kontainer daftar

// Konstanta ikon... (tidak berubah)
const ICON_CLOCK = "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z";
const ICON_STAR =
  "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.sem563 0 00.475-.345L11.48 3.5z";
const ICON_SUBTASK =
  "M3 13h2V3H3v10zm4 0h2V6H7v7zm4 0h2V8h-2v5zm4 0h2V1h-2v12z";

// --- LOGIC ---
const getRank = async (filterStartDate: string, filterEndDate: string) => {
  controller = new AbortController();
  const signal = controller.signal;
  if (sourceUsers.value.length === 0) return [];

  const userMap = new Map(sourceUsers.value.map((user) => [user.key, user]));

  const parentFetchPromises = sourceUsers.value.map((user) =>
    $fetch<JiraIssue>(`/api/jira/${user.key}`, { signal }),
  );
  const jiraIssues = await Promise.all(parentFetchPromises);

  let allFetchedSubtasks: JiraIssue[] = [];
  const allSubtaskKeys = jiraIssues.flatMap((issue) =>
    (issue.fields.subtasks || []).map((subtask) => subtask.key),
  );

  if (allSubtaskKeys.length > 0) {
    const uniqueKeys = [...new Set(allSubtaskKeys)];
    const jql = `key in (${uniqueKeys.join(",")})`;
    const requiredFields = [
      "summary",
      "status",
      "created",
      "timeestimate",
      "parent",
    ];
    const searchResult = await $fetch<{ issues: JiraIssue[] }>(
      "/api/jira/search",
      {
        method: "POST",
        signal,
        body: { jql, fields: requiredFields, maxResults: uniqueKeys.length },
      },
    );
    allFetchedSubtasks = searchResult.issues;
  }

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

  const filterStart = new Date(filterStartDate);
  const filterEnd = new Date(filterEndDate);
  filterEnd.setDate(filterEnd.getDate() + 1);

  // =========================================================================
  // PERUBAHAN DI SINI
  // =========================================================================
  const processedData = enrichedJiraIssues.map((enrichedIssue) => {
    const filteredSubtasks = enrichedIssue.fields.subtasks.filter((st) => {
      const createdDate = new Date(st.fields.created);
      return createdDate >= filterStart && createdDate < filterEnd;
    });

    // ---- KODE `if` DAN `.filter(item => item !== null)` DIHAPUS ----
    // if (filteredSubtasks.length === 0) return null; // <-- BARIS INI DIHAPUS

    // Kalkulasi akan secara alami menghasilkan 0 jika filteredSubtasks kosong
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
        avatar: enrichedIssue.fields.assignee?.avatarUrls["48x48"] || "",
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
  }) as any[]; // `.filter(item => item !== null)` juga dihapus

  // =========================================================================
  // AKHIR PERUBAHAN
  // =========================================================================

  processedData.sort((a, b) => {
    const pointDiff = b.sortable.points - a.sortable.points;
    if (pointDiff !== 0) return pointDiff;
    const timeDiff = b.sortable.time - a.sortable.time;
    if (timeDiff !== 0) return timeDiff;
    return b.sortable.ratio - a.sortable.ratio;
  });

  const finalData = processedData.map((item, index) => {
    const { sortable, ...rest } = item;
    return { ...rest, rank: index + 1 };
  });

  return finalData;
};

// --- EXECUTION ---
const handleFilter = async () => {
  if (!startDate.value || !endDate.value) {
    alert("Silakan isi tanggal mulai dan tanggal selesai.");
    return;
  }
  hasFiltered.value = true;
  pending.value = true;
  try {
    const result = await getRank(startDate.value, endDate.value);
    rankedUsersData.value = result;
  } catch (err: any) {
    errorStore.addError({
      type: "network",
      title: err.statusMessage || "Gagal Mengambil Data",
      message:
        err.data?.message ||
        err.message ||
        "Terjadi kesalahan saat menghubungi server.",
      details: err,
    });
  } finally {
    pending.value = false;
  }
};

// --- 3. GSAP ANIMATION ---
// Gunakan `watch` untuk mendeteksi perubahan data dan memicu animasi
// Di dalam <script setup> di Ranking.vue

watch(rankedUsersData, (newValue) => {
  if (newValue && newValue.length > 0) {
    nextTick(() => {
      if (rankListContainer.value) {
        const cards = rankListContainer.value.children;

        // 1. Set keadaan awal semua kartu (tersembunyi)
        gsap.set(cards, { autoAlpha: 0 });

        // 2. Buat timeline utama untuk mengatur semua animasi
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // 3. Animasikan setiap kartu dengan stagger
        tl.to(cards, {
          autoAlpha: 1, // autoAlpha = opacity + visibility (lebih baik untuk performa)
          duration: 1,
          stagger: 1, // Jeda antar kartu
        });

        // 4. Animasikan elemen di dalam setiap kartu (opsional, tapi ini yang membuatnya keren)
        // Animasi ini berjalan sedikit setelah kartu mulai muncul
        gsap.from(gsap.utils.toArray(".rank-anim"), {
          duration: 0.6,
          scale: 0.5,
          opacity: 0,
          delay: 0.2,
          stagger: 0.5,
          ease: "back.out(1.7)",
        });

        gsap.from(gsap.utils.toArray(".user-anim"), {
          duration: 0.6,
          y: 20,
          opacity: 0,
          delay: 0.4,
          stagger: 0.1,
        });

        gsap.from(gsap.utils.toArray(".stat-anim"), {
          duration: 0.5,
          x: -20,
          opacity: 0,
          delay: 0.6,
          stagger: 0.05,
        });
      }
    });
  }
});

onUnmounted(() => {
  if (controller) controller.abort();
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
              <label class="form-label" for="startDate">Tanggal Mulai</label>
              <input
                id="startDate"
                v-model="startDate"
                class="form-control"
                required
                type="date"
              />
            </div>
            <div class="col-md">
              <label class="form-label" for="endDate">Tanggal Selesai</label>
              <input
                id="endDate"
                v-model="endDate"
                class="form-control"
                required
                type="date"
              />
            </div>
            <div class="col-md-auto">
              <button
                :disabled="pending"
                class="btn btn-primary w-100"
                type="submit"
              >
                <span
                  v-if="pending"
                  aria-hidden="true"
                  class="spinner-border spinner-border-sm"
                  role="status"
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
            :class="`is-rank-${item.rank}`"
            :rank="item.rank"
            :stats="item.stats"
            :user="item.user"
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
