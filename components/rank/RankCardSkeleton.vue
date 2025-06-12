<script setup lang="ts"></script>

<template>
  <div class="skeleton-card">
    <div class="skeleton-rank-display">
      <div class="skeleton-placeholder skeleton-rank-number"></div>
    </div>

    <div class="skeleton-divider-vertical"></div>

    <div class="skeleton-card-content">
      <div class="skeleton-user-profile">
        <div class="skeleton-placeholder skeleton-avatar"></div>
        <div class="skeleton-user-info">
          <div class="skeleton-placeholder skeleton-user-name"></div>
          <div class="skeleton-placeholder skeleton-user-email"></div>
        </div>
      </div>

      <div class="skeleton-stats-container">
        <div class="skeleton-stat-block">
          <div class="skeleton-placeholder skeleton-stat-value"></div>
          <div class="skeleton-placeholder skeleton-stat-label"></div>
        </div>
        <div class="skeleton-stat-block">
          <div class="skeleton-placeholder skeleton-stat-value"></div>
          <div class="skeleton-placeholder skeleton-stat-label"></div>
        </div>
        <div class="skeleton-stat-block">
          <div class="skeleton-placeholder skeleton-stat-value"></div>
          <div class="skeleton-placeholder skeleton-stat-label"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Pindahkan SEMUA style .skeleton-* ke sini */
@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}
.skeleton-placeholder {
  background-color: #eef0f2;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.skeleton-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: #ffffff;
  border-radius: 16px;
  padding: 1rem 1.5rem;
  border: 1px solid #e5e7eb;
  min-height: 140px;
}
.skeleton-rank-display {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  flex-shrink: 0;
}
.skeleton-rank-number {
  width: 30px;
  height: 48px;
  border-radius: 8px;
}
.skeleton-divider-vertical {
  width: 1px;
  align-self: stretch;
  background-color: #e5e7eb;
}
.skeleton-card-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.skeleton-user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
}
.skeleton-user-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}
.skeleton-user-name {
  height: 18px;
  width: 70%;
  border-radius: 4px;
}
.skeleton-user-email {
  height: 14px;
  width: 50%;
  border-radius: 4px;
}
.skeleton-stats-container {
  display: flex;
  justify-content: space-around;
  background-color: #f9fafb;
  padding: 0.75rem;
  border-radius: 12px;
}
.skeleton-stat-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  width: 30%;
}
.skeleton-stat-value {
  height: 20px;
  width: 60%;
  border-radius: 6px;
  margin-bottom: 4px;
}
.skeleton-stat-label {
  height: 12px;
  width: 90%;
  border-radius: 4px;
}
</style>
