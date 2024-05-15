<template>
  <div>
    <span>sort by: </span>
    <select v-model="sortMethod">
      <option>name</option>
      <option>percent</option>
      <option>passing</option>
      <option>error</option>
      <option>failing</option>
      <option>crashing</option>
      <option>timeout</option>
      <option>notrun</option>
      <option>precondition</option>
      <option>total</option>
    </select>
  </div>
  <ItemRow :path="prevPath()" :go-back="true" :is-root="isRoot" />
  <ChildRow v-for="name of sortedChildren" :key="name" :path="nextPath(name)" />
  <ResultRow v-for="name of sortedResults" :key="name" :path="nextPath(name)" />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import ItemRow from "../components/ItemRow.vue";
import ChildRow from "../components/ChildRow.vue";
import ResultRow from "../components/ResultRow.vue";
import { useStore } from "vuex";

const props = defineProps(["filepath"]);
const basePath = props.filepath;
const nextPath = (name) => {
  if (basePath === undefined) return [name];
  return [...basePath, name];
};

const prevPath = () => {
  if (basePath === undefined) return [];
  return basePath.slice(0, -1);
};

const isRoot = basePath === undefined || basePath.length === 0;

const hasPathUp = basePath !== undefined && basePath.length > 0;

const pathToUse = basePath === undefined ? [] : basePath;

const store = useStore();
const allChildren = store.getters.childKeysFromPath(pathToUse);
const sortedChildren = ref([]);

const allResults = store.getters.resultKeysFromPath(pathToUse);
const sortedResults = ref([]);

const sortMethod = ref();

watch(sortMethod, () => {
  sortedChildren.value = allChildren.toSorted((a, b) => {
    if (sortMethod.value === "name") {
      return a.localeCompare(b);
    } else if (sortMethod.value === "percent") {
      const aCounts = store.getters.countsForPath([pathToUse, a]);
      const bCounts = store.getters.countsForPath([pathToUse, b]);

      const aPercent = Math.round((aCounts.passing / aCounts.total) * 100);
      const bPercent = Math.round((bCounts.passing / bCounts.total) * 100);

      return bPercent - aPercent;
    } else {
      const aValue = store.getters.countsForPath([pathToUse, a])[
        sortMethod.value
      ];
      const bValue = store.getters.countsForPath([pathToUse, b])[
        sortMethod.value
      ];
      return bValue - aValue;
    }
  });

  sortedResults.value = allResults.toSorted((a, b) => {
    if (sortMethod.value === "name") {
      return a.parent.localeCompare(b.parent);
    } else if (sortMethod.value === "percent") {
      const aCounts = store.getters.countsForPath([pathToUse, a]);
      const bCounts = store.getters.countsForPath([pathToUse, b]);

      const aPercent = Math.round((aCounts.passing / aCounts.total) * 100);
      const bPercent = Math.round((bCounts.passing / bCounts.total) * 100);

      return bPercent - aPercent;
    } else {
      const aValue = store.getters.countsForPath([pathToUse, a])[
        sortMethod.value
      ];
      const bValue = store.getters.countsForPath([pathToUse, b])[
        sortMethod.value
      ];
      return bValue - aValue;
    }
  });
});

sortMethod.value = "name";
</script>
