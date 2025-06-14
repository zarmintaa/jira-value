<script lang="ts" setup>
interface SquadPerformance {
  id: string;
  name: string;
  memberCount: number;
  totalSubtasksDone: number;
  totalHoursDone: number;
  completionRatio: number;
}

defineProps<{
  squads: SquadPerformance[];
  loading: boolean;
}>();
</script>

<template>
  <div class="card shadow-sm border-0">
    <div class="card-header bg-white">
      <h5 class="fw-bold">Performa Squad</h5>
    </div>
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th scope="col">Nama Squad</th>
              <th scope="col" class="text-center">Anggota</th>
              <th scope="col" class="text-center">Subtask Selesai</th>
              <th scope="col" class="text-center">Jam Selesai</th>
              <th scope="col" style="min-width: 200px">Rasio Penyelesaian</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr v-for="n in 3" :key="`skel-${n}`">
                <td>
                  <div class="placeholder-glow">
                    <span class="placeholder col-8"></span>
                  </div>
                </td>
                <td class="text-center">
                  <div class="placeholder-glow">
                    <span class="placeholder col-4"></span>
                  </div>
                </td>
                <td class="text-center">
                  <div class="placeholder-glow">
                    <span class="placeholder col-4"></span>
                  </div>
                </td>
                <td class="text-center">
                  <div class="placeholder-glow">
                    <span class="placeholder col-4"></span>
                  </div>
                </td>
                <td>
                  <div class="placeholder-glow">
                    <span class="placeholder col-12"></span>
                  </div>
                </td>
              </tr>
            </template>

            <template v-else-if="squads.length > 0">
              <tr v-for="squad in squads" :key="squad.id">
                <td>
                  <span class="fw-medium">{{ squad.name }}</span>
                </td>
                <td class="text-center">{{ squad.memberCount }}</td>
                <td class="text-center">{{ squad.totalSubtasksDone }}</td>
                <td class="text-center">
                  {{ squad.totalHoursDone.toFixed(1) }}h
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <span class="fw-bold" style="width: 50px"
                      >{{ squad.completionRatio.toFixed(0) }}%</span
                    >
                    <div class="progress" style="width: 100%">
                      <div
                        class="progress-bar gradient"
                        role="progressbar"
                        :style="{ width: `${squad.completionRatio}%` }"
                        :aria-valuenow="squad.completionRatio"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>

            <template v-else>
              <tr>
                <td colspan="5" class="text-center text-muted">
                  Tidak ada data performa untuk ditampilkan.
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gradient {
  background: linear-gradient(to right, #300171, #007bff) !important;
}
</style>
