<template>
  <div class="graph-view">
    <div>
      <h1>Graph View</h1>
    </div>
    <div class="chart-container">
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
const currentPathScores = store.getters.countsForPath(pathToUse, false);

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

const data = {
  datasets: [
    {
      data: currentPathScores,
      fill: true,
    },
  ],
};
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
