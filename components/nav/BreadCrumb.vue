<!-- components/ui/BreadcrumbDinamis.vue -->
<script lang="ts" setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const segments = computed(() => {
  const parts = route.path.split("/").filter(Boolean);
  const result: { label: string; path: string | null }[] = [];
  let pathAcc = "";

  parts.forEach((part, index) => {
    pathAcc += `/${part}`;
    result.push({
      label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "),
      path: index < parts.length - 1 ? pathAcc : null, // last item = active
    });
  });

  return result;
});

function navigateTo(path: string | null) {
  if (path) router.push(path);
}
</script>

<template>
  <nav aria-label="breadcrumb" class="mb-3">
    <ol class="breadcrumb custom-breadcrumb">
      <li class="breadcrumb-item">
        <a href="#" @click.prevent="navigateTo('/')">
          <i class="bi bi-house-door-fill me-1"></i> Home
        </a>
      </li>
      <li
        v-for="(seg, index) in segments"
        :key="index"
        :class="{ active: !seg.path }"
        aria-current="page"
        class="breadcrumb-item"
      >
        <template v-if="seg.path">
          <a href="#" @click.prevent="navigateTo(seg.path)">{{ seg.label }}</a>
        </template>
        <template v-else>
          <span>{{ seg.label }}</span>
        </template>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.custom-breadcrumb {
  background-color: transparent;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.95rem;
}

.custom-breadcrumb .breadcrumb-item a {
  text-decoration: none;
  color: #0d6efd;
  transition: color 0.2s ease-in-out;
  cursor: pointer;
}

.custom-breadcrumb .breadcrumb-item a:hover {
  color: #0a58ca;
}

.custom-breadcrumb .breadcrumb-item.active {
  font-weight: 600;
  color: #495057;
}
</style>
