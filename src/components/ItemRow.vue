<template>
  <div class="itemRow" @click="pushPath()">
    <span>
      <b v-if="!props.goBack">{{ props.path[props.path.length - 1] }}</b>
      <template v-else>
        <b v-if="!props.isRoot">Parent:</b>
        <b v-else>Total:</b>
      </template>
    </span>
    <div class="statContainer">
      <span>{{ passPercent }}%</span>
      <span v-for="(count, name) in counts" :key="name" class="statRow">
        {{ name }}: {{ count }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import chroma from "chroma-js";
import { computed } from "vue";
const store = useStore();
const props = defineProps(["path", "goBack", "isRoot"]);
const counts = store.getters.countsForPath(props.path);
const passPercent = Math.round((counts.passing / counts.total) * 100);

const router = useRouter();
const pushPath = () => {
  router.push({ name: "RUNVIEW", params: { filepath: [...props.path] } });
};

const itemGradient = computed(() => {
  const gradients = [
    {
      weight: 100,
      background: [50, 200, 25],
    },
    {
      weight: 50,
      background: [200, 170, 40],
    },
    {
      weight: 0,
      background: [200, 50, 25],
    },
  ];

  const scale = chroma
    .scale(gradients.map((g) => chroma(g.background)))
    .domain(gradients.map((g) => g.weight))
    .mode("lab");

  const colorToUse = scale(passPercent);
  const contrast = chroma.contrast(colorToUse, "white");

  let textColor = "white";
  if (contrast < 3) {
    textColor = "black";
  }

  const colorString = colorToUse.css();

  return {
    color: textColor,
    background: colorString,
  };
});
</script>

<style scoped>
.itemRow {
  margin: 10px 0px;
  padding: 10px;
  border: 1px solid black;

  background: v-bind("itemGradient.background");
  color: v-bind("itemGradient.color");

  &:hover {
    opacity: 0.5;
    cursor: pointer;
  }

  display: flex;
  justify-content: space-between;
  align-items: center;

  .statContainer {
    display: grid;
    grid-template-columns: repeat(9, minmax(130px, 1fr));
    grid-template-rows: 1fr;
  }
}
</style>
