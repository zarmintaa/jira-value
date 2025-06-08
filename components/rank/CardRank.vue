<script setup lang="ts">
import type { PropType } from "vue";

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface StatItem {
  label: string;
  value: string | number;
  icon: string;
}

defineProps({
  rank: {
    type: Number,
    required: true,
  },
  user: {
    type: Object as PropType<User>,
    required: true,
  },
  stats: {
    type: Array as PropType<StatItem[]>,
    required: true,
  },
});
</script>

<template>
  <div class="rank-card h-100">
    <div class="rank-display">
      <div v-if="rank === 1" class="crown-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M19.467 5.426l-3.58 3.58-1.414-1.414 3.58-3.58-1.892-1.892-3.58 3.58-2.12-2.12-3.58 3.58-1.893-1.892 3.58-3.58-1.414-1.414-3.58 3.58a1 1 0 000 1.414l5.657 5.657a1 1 0 00.707.293h.001a1 1 0 00.707-.293l5.657-5.657a1 1 0 000-1.414l-1.638-1.638zM12 13a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1v-7a1 1 0 00-1-1h-7zm-9 0a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1v-7a1 1 0 00-1-1H3z"
          />
        </svg>
      </div>
      <span class="rank-number" :class="`rank-color-${rank}`">{{ rank }}</span>
    </div>

    <div class="divider"></div>

    <div class="card-content">
      <div class="user-profile">
        <img :src="user.avatar" :alt="`${user.name}'s Avatar`" class="avatar" />
        <div class="user-info">
          <h5 class="user-name">{{ user.name }}</h5>
          <p class="user-email">{{ user.email }}</p>
        </div>
      </div>
      <div class="stats-container">
        <div v-for="stat in stats" :key="stat.label" class="stat-block">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rank-card {
  --color-gold: #d4af37;
  --color-silver: #a7a7ad;
  --color-bronze: #a97142;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --card-bg: #ffffff;
  --border-color: #e5e7eb;
  --card-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  --card-hover-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);

  /* MENGGUNAKAN FLEXBOX UNTUK LAYOUT UTAMA */
  display: flex;
  align-items: center;
  gap: 1.5rem; /* Jarak antar kolom */

  background: var(--card-bg);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
  transition: all 0.2s ease-in-out;

  /* ANIMASI ENTRY */
  opacity: 0; /* Mulai dari transparan */
  animation: card-entry 0.5s ease-out forwards;
}

.rank-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--card-hover-shadow);
}

/* EFEK KHUSUS UNTUK PERINGKAT 1 */
.rank-card.is-rank-1 {
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.08),
    0 0 20px rgba(212, 175, 55, 0.4);
}

.rank-card.is-rank-1:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.1),
    0 0 30px rgba(212, 175, 55, 0.5);
}

/* OPASITAS UNTUK PERINGKAT 4 KE BAWAH (OPSIONAL) */
.rank-card:not(.is-rank-1):not(.is-rank-2):not(.is-rank-3) {
  opacity: 0.9; /* Sedikit lebih redup */
}

/* Kolom Peringkat (Kiri) */
.rank-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.crown-icon {
  color: var(--color-gold);
  width: 24px;
  margin-bottom: -8px; /* Agar mahkota menempel di atas angka */
}

.rank-number {
  font-size: 3rem;
  font-weight: 800;
  color: var(--text-secondary); /* Warna default untuk rank 4+ */
}

/* Teks Gradien untuk Peringkat Teratas */
.rank-color-1 {
  background: linear-gradient(45deg, var(--color-gold), #b8860b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}
.rank-color-2 {
  background: linear-gradient(45deg, var(--color-silver), #8e8e93);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}
.rank-color-3 {
  background: linear-gradient(45deg, var(--color-bronze), #8c5a2d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

/* Pemisah Vertikal */
.divider {
  width: 1px;
  align-self: stretch; /* Membuat tinggi pemisah sama dengan tinggi kartu */
  background-color: var(--border-color);
}

/* Kolom Konten (Kanan) */
.card-content {
  flex-grow: 1; /* Mengisi sisa ruang */
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-profile {
  display: flex;
  align-items: center;
  text-align: left;
  gap: 1rem;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}
.user-email {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

/* Statistik */
.stats-container {
  display: flex;
  justify-content: space-around;
  background-color: #f9fafb;
  padding: 0.75rem;
  border-radius: 12px;
}

.stat-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}
.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* KEYFRAMES UNTUK ANIMASI ENTRY */
@keyframes card-entry {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
