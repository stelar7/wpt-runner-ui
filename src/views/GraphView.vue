<template>
  <div class="graph-view">
    <div>
      <h1>Graph View</h1>
      <p v-if="loadingGraphData">Loading graph data...</p>
    </div>
    <div class="chart-container" :key="updateKey">
      <Line :data="data" :options="options" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Filler,
  Colors,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-moment";
import moment from "moment";
import { Line } from "vue-chartjs";
import { nextTick, ref, shallowRef } from "vue";
Chart.register(
  Title,
  Tooltip,
  Legend,
  Filler,
  Colors,
  TimeScale,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement
);

const props = defineProps(["filepath"]);
const basePath = props.filepath?.length > 0 ? props.filepath : undefined;
const pathToUse = basePath === undefined ? [] : basePath;

const store = useStore();

const options = {
  responsive: true,
  plugins: {
    title: {
      display: false,
    },
    tooltip: {
      mode: "index",
    },
    legend: {
      display: false,
    },
  },
  interaction: {
    mode: "nearest",
    axis: "x",
    intersect: false,
  },
  scales: {
    x: {
      type: "time",
      title: {
        display: false,
      },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      title: {
        display: false,
      },
    },
  },
};

const data = shallowRef({
  datasets: [],
});

for (let i = 0; i < 8; i++) {
  data.value.datasets.push({
    data: [],
    fill: true,
    label: store.getters.indexToType(i),
  });
}

const updateKey = ref(1);

const loadingGraphData = ref(true);

nextTick(async () => {
  const allFiles = store.state.fileList;
  for (let file of allFiles) {
    await store.dispatch("fetchWPTData", file.name);

    const fileData = store.getters.countsForPath(pathToUse, false, file.name);

    const timestamp = file.name.split(".")[0];
    const date = moment(+timestamp);

    for (let keyName in fileData) {
      const key = store.getters.typeToIndex(keyName);
      data.value.datasets[key].data.push({
        x: date,
        y: fileData[keyName],
      });
    }

    // Need to update something in the UI for the graph to update, so we use a :key on the parent
    updateKey.value += 1;
  }

  loadingGraphData.value = false;
});
</script>

<style scoped>
.graph-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 85vh;
  width: 90vw;

  .chart-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 100%;
    height: 100%;
  }
}
</style>
