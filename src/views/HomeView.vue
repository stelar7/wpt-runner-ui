<template>
  <div>Loading data...</div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { watch } from "vue";

const store = useStore();
store.dispatch("fetchWPTData");

const router = useRouter();

watch(
  () => store.state.data,
  () => router.push({ name: "RUNVIEW" })
);
</script>

<style scoped>
div {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 2rem;
}
</style>
