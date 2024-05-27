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
} from "chart.js";
import { Line } from "vue-chartjs";
import { nextTick, ref } from "vue";
Chart.register(
  Title,
  Tooltip,
  Legend,
  Filler,
  Colors,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement
);

const props = defineProps(["filepath"]);
const basePath = props.filepath;
const pathToUse = basePath === undefined ? [] : basePath;

const store = useStore();

const options = {
  responsive: true,
  plugins: {
    title: {
      display: false,
      text: (ctx) =>
        "Chart.js Line Chart - stacked=" + ctx.chart.options.scales.y.stacked,
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
      title: {
        display: false,
      },
    },
    y: {
      stacked: true,
      title: {
        display: false,
      },
    },
  },
};

const data = ref({
  datasets: [],
});

const updateKey = ref(1);

const loadingGraphData = ref(true);

nextTick(async () => {
  const allFiles = store.state.fileList;
  for (let file of allFiles) {
    await store.dispatch("fetchWPTData", file.name);

    const fileData = store.getters.countsForPath(pathToUse, false, file.name);

    data.value.datasets.push({
      data: fileData,
      fill: true,
    });

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
