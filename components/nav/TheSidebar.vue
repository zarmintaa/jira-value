<script lang="ts" setup>
import IconUserGroups from "~/components/icons/IconUserGroups.vue";
import IconHome from "~/components/icons/IconHome.vue";
import IconLabel from "~/components/icons/IconLabel.vue";

const route = useRoute();

const menuItems = [
  {
    name: "Dashboard",
    // Pastikan Anda punya file 'pages/dashboard.vue'
    routeName: "dashboard",
    icon: IconHome,
  },
  {
    name: "List Jira",
    // Pastikan Anda punya file 'pages/list-jira.vue'
    routeName: "list-jira", // Di Nuxt, nama rute biasanya kebab-case
    icon: IconUserGroups,
  },
  {
    name: "Error Debug",
    // Pastikan Anda punya file 'pages/error-debug.vue'
    routeName: "error-debug",
    icon: IconLabel,
  },
  {
    name: "Ticket",
    // Pastikan Anda punya file 'pages/error-debug.vue'
    routeName: "ticket",
    icon: IconLabel,
  },
];
</script>

<template>
  <nav
    class="col-lg-2 d-none d-md-block sidebar bg-white min-vh-100 position-fixed"
  >
    <header class="d-flex align-items-center justify-content-center py-4">
      <h3 class="font__pacifico text__blue__gradient">JiraPoints</h3>
    </header>
    <ul class="nav flex-column px-1 mt-3 gap-2">
      <li
        v-for="item in menuItems"
        :key="item.routeName"
        :class="{
          'bg-light-indigo rounded bg-gradient': route.name === item.routeName,
        }"
      >
        <NuxtLink
          :to="{ name: item.routeName }"
          active-class="text-primary"
          class="d-flex align-items-center px-3 gap-3 py-3"
        >
          <component :is="item.icon" />
          <span class="fs-6 fw-medium">{{ item.name }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
/* 3. BAGIAN STYLE INI TIDAK PERLU DIUBAH. Ini akan tetap berfungsi. */
@import url("https://fonts.googleapis.com/css2?family=Pacifico&display=swap");

.font__pacifico {
  font-family: "Pacifico", cursive;
  font-size: 2.3rem;
  font-weight: normal;
}

.text__blue__gradient {
  background: linear-gradient(
    90deg,
    #300171,
    #007bff
  ); /* Dark Indigo to Bright Blue */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  letter-spacing: 0.5px;
  margin: 0;
}
</style>
