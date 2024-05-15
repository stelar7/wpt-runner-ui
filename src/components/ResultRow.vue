<template>
  <div class="itemRow" @click="pushPath()">
    <b>{{ props.path[props.path.length - 1] }}</b>
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
const store = useStore();
const props = defineProps(["path", "goBack", "isRoot"]);
const counts = store.getters.countsForPath(props.path);
const passPercent = Math.round((counts.passing / counts.total) * 100);

const router = useRouter();
const pushPath = () => {
  router.push({ name: "RUNVIEW", params: { filepath: [...props.path] } });
};

let itemColor = "white";
let itemBackground = "transparent";
if (passPercent > 75) {
  itemBackground = "rgba(144, 238, 144, 0.5)";
} else if (passPercent > 50) {
  itemBackground = "rgba(255, 255, 0, 0.5)";
  itemColor = "black";
} else if (passPercent > 25) {
  itemBackground = "rgba(255, 165, 0, 0.5)";
} else {
  itemBackground = "rgba(240, 128, 128, 0.5)";
}
</script>

<style scoped>
.itemRow {
  margin: 10px 0px;
  padding: 10px;
  border: 1px solid black;

  background: v-bind("itemBackground");
  color: v-bind("itemColor");

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
