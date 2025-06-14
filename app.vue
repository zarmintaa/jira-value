<script lang="ts" setup>
import { Analytics } from "@vercel/analytics/nuxt";
</script>

<template>
  <div>
    <Analytics />

    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtLoadingIndicator :height="3" :duration="3000" :throttle="100" />
      <NuxtPage />
      <ErrorNotificationList />
    </NuxtLayout>
  </div>
</template>

<style>
.nuxt-loading-indicator {
  background: linear-gradient(to right, #300171, #007bff) !important;
}
</style>
