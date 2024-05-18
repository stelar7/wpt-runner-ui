<template>
  <div class="innerResultRow">
    <b>{{ props.name }}</b>
    <div class="statContainer">
      <span>{{ statusTitle }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { computed } from "vue";
import chroma from "chroma-js";
const store = useStore();
const props = defineProps(["path", "name"]);

const entryValues = store.getters.getFromPath(props.path);

var passPercent = 0;
var statusTitle = "Failing";
if (entryValues.passing.find((element) => element.name === props.name)) {
  passPercent = 100;
  statusTitle = "Passing";
} else if (entryValues.failing.find((element) => element.name === props.name)) {
  passPercent = 0;
  statusTitle = "Failing";
} else if (entryValues.notrun.find((element) => element.name === props.name)) {
  passPercent = 0;
  statusTitle = "Not Run";
} else if (entryValues.errors.find((element) => element.name === props.name)) {
  passPercent = 0;
  statusTitle = "Error";
} else if (
  entryValues.crashing.find((element) => element.name === props.name)
) {
  passPercent = 0;
  statusTitle = "Crashing";
} else if (entryValues.timeout.find((element) => element.name === props.name)) {
  passPercent = 0;
  statusTitle = "Timeout";
} else if (
  entryValues.precondition.find((element) => element.name === props.name)
) {
  passPercent = 0;
  statusTitle = "Precondition";
}

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
.innerResultRow {
  margin: 10px 0px;
  padding: 10px;
  border: 1px solid black;

  background: v-bind("itemGradient.background");
  color: v-bind("itemGradient.color");

  &:hover {
    opacity: 0.5;
  }

  display: flex;
  justify-content: space-between;
  align-items: center;

  .statContainer {
    display: grid;
    grid-template-columns: minmax(130px, 1fr);
    grid-template-rows: 1fr;
  }
}
</style>
