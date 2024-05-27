<template>
  <div>Loading data...</div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { watch } from "vue";

const store = useStore();
store.dispatch("fetchFileList");
store.dispatch("fetchWPTData");

const router = useRouter();

if (store.state.data["latest.json"] != null) {
  router.replace({ name: "RUNVIEW" });
}

watch(
  () => store.state.data["latest.json"],
  () => {
    const redirect = store.state.redirectUrl;
    if (redirect == null) {
      router.replace({ name: "RUNVIEW" });
      return;
    }

    store.dispatch("setRedirectUrl", null);
    router.replace(redirect);
  }
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
