<template>
  <Suspense>
    <InnerRouterView />
  </Suspense>
</template>

<script setup lang="ts">
import InnerRouterView from "./views/InnerRouterView.vue";
</script>

<style>
body {
  min-width: 1395px;
}
</style>