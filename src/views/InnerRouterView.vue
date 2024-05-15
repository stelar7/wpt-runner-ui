<template>
  <RouterView :key="$route.path" />
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
</script>
