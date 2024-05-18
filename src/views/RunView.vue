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
  <span v-if="sortedChildren.length > 0">Subfolders:</span>
  <ChildRow v-for="name of sortedChildren" :key="name" :path="nextPath(name)" />
  <span v-if="sortedResults.length > 0">Tests:</span>
  <ResultRow
    v-for="entry of sortedResults"
    :key="entry.parent"
    :path="nextResultPath(entry.parent)"
  />
  <InnerResultRow
    v-for="entry of sortedResultsInner"
    :key="entry.name"
    :path="basePath"
    :name="entry.name"
  />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import ItemRow from "../components/ItemRow.vue";
import ChildRow from "../components/ChildRow.vue";
import ResultRow from "../components/ResultRow.vue";
import InnerResultRow from "../components/InnerResultRow.vue";
import { useStore } from "vuex";

const props = defineProps(["filepath"]);
const basePath = props.filepath;
//const basePath = ["quirks"];
const nextPath = (name) => {
  if (basePath === undefined) return [name];
  return [...basePath, name];
};

const nextResultPath = (parent) => {
  const parentPath = parent.split("/");
  const lastPath = parentPath[parentPath.length - 1];

  if (basePath === undefined) return [lastPath];
  return [...basePath, lastPath];
};

const prevPath = () => {
  if (basePath === undefined) return [];
  return basePath.slice(0, -1);
};

const isRoot = basePath === undefined || basePath.length === 0;
const pathToUse = basePath === undefined ? [] : basePath;

const store = useStore();
const allChildren = store.getters.childKeysFromPath(pathToUse);
const sortedChildren = ref([]);

const allResults = store.getters.resultKeysFromPath(pathToUse);
const sortedResults = ref([]);

const allResultsInner = store.getters.getFromPath(pathToUse);
const sortedResultsInner = ref([]);

const sortMethod = ref();
watch(sortMethod, () => {
  function typeToValue(type) {
    if (allResultsInner.passing.find((element) => element.name === type)) {
      return 1;
    }

    if (allResultsInner.failing.find((element) => element.name === type)) {
      return 2;
    }

    if (allResultsInner.notrun.find((element) => element.name === type)) {
      return 3;
    }

    if (allResultsInner.errors.find((element) => element.name === type)) {
      return 4;
    }

    if (allResultsInner.crashing.find((element) => element.name === type)) {
      return 5;
    }

    if (allResultsInner.timeout.find((element) => element.name === type)) {
      return 6;
    }

    if (allResultsInner.precondition.find((element) => element.name === type)) {
      return 7;
    }

    return 8;
  }

  sortedChildren.value = allChildren.toSorted((a, b) => {
    const aCounts = store.getters.countsForPath([...pathToUse, a]);
    const bCounts = store.getters.countsForPath([...pathToUse, b]);
    if (sortMethod.value === "name") {
      return a.localeCompare(b);
    } else if (sortMethod.value === "percent") {
      const aPercent = Math.round((aCounts.passing / aCounts.total) * 100);
      const bPercent = Math.round((bCounts.passing / bCounts.total) * 100);

      return bPercent - aPercent;
    } else {
      const aValue = aCounts[sortMethod.value];
      const bValue = bCounts[sortMethod.value];
      return bValue - aValue;
    }
  });

  sortedResults.value = allResults.toSorted((a, b) => {
    const aPath = a.parent.split("/");
    const bPath = b.parent.split("/");
    const aLast = aPath[aPath.length - 1];
    const bLast = bPath[bPath.length - 1];
    const aCounts = store.getters.resultValuesForPath([...pathToUse, aLast]);
    const bCounts = store.getters.resultValuesForPath([...pathToUse, bLast]);

    if (Object.values(aCounts).reduce((a, b) => a + b, 0) === 0) {
      aCounts.total = 1;
      if (a.status === "PASS") {
        aCounts.passing = 1;
      } else if (a.status === "FAIL") {
        aCounts.failing = 1;
      } else if (a.status === "TIMEOUT") {
        aCounts.timeout = 1;
      } else if (a.status === "ERROR") {
        aCounts.error = 1;
      } else {
        console.log("UNHANDLED STATUS VV" + a.status);
      }
    }

    if (Object.values(bCounts).reduce((a, b) => a + b, 0) === 0) {
      bCounts.total = 1;
      if (b.status === "PASS") {
        bCounts.passing = 1;
      } else if (b.status === "FAIL") {
        bCounts.failing = 1;
      } else if (b.status === "TIMEOUT") {
        bCounts.timeout = 1;
      } else if (b.status === "ERROR") {
        bCounts.error = 1;
      } else {
        console.log("UNHANDLED STATUS CC " + b.status);
      }
    }

    if (sortMethod.value === "name") {
      return a.parent.localeCompare(b.parent);
    } else if (sortMethod.value === "percent") {
      const aPercent = Math.round((aCounts.passing / aCounts.total) * 100);
      const bPercent = Math.round((bCounts.passing / bCounts.total) * 100);

      return bPercent - aPercent;
    } else {
      const aValue = aCounts[sortMethod.value];
      const bValue = bCounts([...pathToUse, b])[sortMethod.value];
      return bValue - aValue;
    }
  });

  if (!allResultsInner.parent) {
    return;
  }

  const allMappedResults = allResultsInner.passing
    .concat(allResultsInner.errors)
    .concat(allResultsInner.failing)
    .concat(allResultsInner.crashing)
    .concat(allResultsInner.timeout)
    .concat(allResultsInner.notrun)
    .concat(allResultsInner.precondition);

  sortedResultsInner.value = allMappedResults.toSorted((a, b) => {
    const aValue = typeToValue(a.name)!;
    const bValue = typeToValue(b.name)!;

    if (sortMethod.value === "name") {
      return a.name.localeCompare(b.name);
    } else {
      return bValue - aValue;
    }
  });
});

sortMethod.value = "percent";
</script>
