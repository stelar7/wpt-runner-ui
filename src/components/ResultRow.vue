<template>
  <div class="resultRow" @click="pushPath()">
    <div class="nameColumn">
      <span
        ><b>{{ entryName }}</b></span
      >
      <span><a @click.stop :href="githubLink">(Github)</a></span>
    </div>

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
import { computed } from "vue";
import chroma from "chroma-js";
const store = useStore();
const props = defineProps(["path", "goBack", "isRoot"]);

const githubLink = `https://github.com/web-platform-tests/wpt/tree/master/${props.path.join("/")}`;

const pathEntry = store.getters.getFromPath(props.path);
const entryName = pathEntry.parent.substring(
  pathEntry.parent.lastIndexOf("/") + 1
);

const counts = store.getters.resultValuesForPath(props.path);
if (Object.values(counts).reduce((a, b) => a + b, 0) === 0) {
  counts.total = 1;
  if (pathEntry.status === "PASS") {
    counts.passing = 1;
  } else if (pathEntry.status === "FAIL") {
    counts.failing = 1;
  } else if (pathEntry.status === "ERROR") {
    counts.errors = 1;
  } else if (pathEntry.status === "CRASH") {
    counts.crashing = 1;
  } else if (pathEntry.status === "TIMEOUT") {
    counts.timeout = 1;
  } else if (pathEntry.status === "NOTRUN") {
    counts.notrun = 1;
  } else if (pathEntry.status === "PRECONDITION") {
    counts.precondition = 1;
  } else {
    console.log("UNHANDLED STATUS AA" + pathEntry.status);
  }
}
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
.resultRow {
  margin: 10px 0px;
  padding: 10px;
  border: 1px solid black;

  background: v-bind("itemGradient.background");
  color: v-bind("itemGradient.color");

  .nameColumn {
    display: flex;
    gap: 5px;

    a {
      color: v-bind("itemGradient.color");
    }
  }

  &:hover:not(:has(a:hover)) {
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
