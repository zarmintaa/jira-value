<script lang="ts" setup>
import TheSidebar from "~/components/nav/TheSidebar.vue";
import TheHeader from "~/components/nav/TheHeader.vue";
import BreadCrumb from "~/components/nav/BreadCrumb.vue";
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <TheSidebar />

      <div class="ms-sm-auto col-lg-10 content p-0">
        <TheHeader />
        <section id="main" class="m-5">
          <BreadCrumb />
          <slot />
        </section>
      </div>
    </div>
  </div>
</template>

<style></style>
