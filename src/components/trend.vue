<template>
  <div id="trend" class="com-container">
    <div class="title" :style="cacStyle">
      <div @click="showOption = !showOption">
        <span>{{ "▎" + selectTitle }}</span>
        <span
          class="icon iconfont title-icon"
          :style="cacStyle"
          v-if="!showOption"
          >&#xe600;</span
        >
        <span class="icon iconfont title-icon" :style="cacStyle" v-else
          >&#xe601;</span
        >
      </div>
      <div class="select-con" v-if="showOption" :style="selectStyle">
        <div
          class="select-item"
          v-for="item in selectOptions"
          :key="item.key"
          :style="marginStyle"
          @click="onChange(item.key)"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
    <div class="com-chart" ref="trend"></div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { getTheme } from "utils/theme.js";
export default {
  name: "trend",
  data() {
    return {
      chartInstance: null,
      allData: null,
      dataType: "map",
      showOption: false,
      titleFontSize: 0,
      params: {
        action: "getData",
        type: "trendData",
        name: "trend",
        value: ""
      }
    };
  },
  created() {
    this.$socket.registerCallBack("trendData", this.getData);
  },
  computed: {
    ...mapState(["theme"]),
    selectOptions() {
      if (!this.allData || !this.allData.type) return [];
      else return this.allData.type.filter(item => this.dataType !== item.key);
    },
    selectTitle() {
      if (!this.allData) return "";
      else return this.allData[this.dataType].title;
    },
    cacStyle() {
      return {
        fontSize: this.titleFontSize + "px",
        color: getTheme(this.theme).titleColor
      };
    },
    marginStyle() {
      return {
        marginLeft: (this.titleFontSize / 3) * 2 + "px",
        backgrounColor: getTheme(this.theme).backgrounColor,
        color: getTheme(this.theme).titleColor
      };
    },
    selectStyle() {
      return {
        backgroundColor: getTheme(this.theme).backgrounColor,
        color: getTheme(this.theme).titleColor
      };
    }
  },
  mounted() {
    this.chartInit();
    // this.getData();
    this.$socket.send(this.params);
    window.addEventListener("resize", this.resizeChart);
    this.resizeChart();
  },
  methods: {
    chartInit() {
      const initOption = {
        grid: {
          left: "3%",
          top: "30%",
          bottom: "1%",
          right: "4%",
          containLabel: true
        },
        tooltip: {
          trigger: "axis"
        },
        legend: {
          top: "16%",
          left: 20,
          icon: "diamond"
        },
        xAxis: {
          type: "category",
          boundaryGap: false
        },
        yAxis: {
          type: "value"
        }
      };
      this.chartInstance = this.$echarts.init(this.$refs.trend, this.theme);
      this.chartInstance.setOption(initOption);
    },
    getData(res) {
      // const { data: res } = await this.$axios.get("trend");
      this.allData = res;
      this.updateChart();
    },
    updateChart() {
      const colorArr1 = [
        "rgba(11, 168, 44, 0.5)",
        "rgba(44, 110, 255, 0.5)",
        "rgba(22,242,217, 0.5)",
        "rgba(254, 33, 30, 0.5)",
        "rgba(250, 105, 0, 0.5)"
      ];
      const colorArr2 = [
        "rgba(11, 168, 44, 0)",
        "rgba(44, 110, 255, 0)",
        "rgba(22, 242, 217, 0)",
        "rgba(254, 33, 30, 0)",
        "rgba(250, 105, 0, 0)"
      ];
      const xAxisArr = this.allData.common.month;
      const seriesArr = this.allData[this.dataType].data.map((item, index) => {
        return {
          name: item.name,
          type: "line",
          stack: this.dataType,
          data: item.data,
          areaStyle: {
            // topLeft(0, 0) -> bottomLeft(0, 1)
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: colorArr1[index]
                },
                {
                  offset: 1,
                  color: colorArr2[index]
                }
              ]
            }
          }
        };
      });
      const legendArr = this.allData[this.dataType].data.map(item => item.name);
      const updateOption = {
        xAxis: {
          data: xAxisArr
        },
        series: seriesArr,
        legend: {
          data: legendArr
        }
      };
      this.chartInstance.setOption(updateOption);
    },
    resizeChart() {
      // 图例，
      this.titleFontSize = (this.$refs.trend.offsetWidth / 100) * 3.6;
      const resizeOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize / 2,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 1.5
          }
        }
      };
      this.chartInstance.setOption(resizeOption);
      this.chartInstance.resize();
    },
    onChange(val) {
      // 不能传递text，因为selectTitle是个计算属性，需要设置setter, getter方可修改值
      this.dataType = val;
      this.updateChart();
      this.showOption = false;
    }
  },
  destroyed() {
    this.$socket.cancelCallBack("trendData");
    window.removeEventListener("resize", this.resizeChart);
  },
  watch: {
    theme() {
      this.chartInstance.dispose();
      this.chartInit();
      this.resizeChart();
      this.updateChart();
    }
  }
};
</script>
<style lang="scss" scoped>
#trend {
  .title {
    position: absolute;
    left: 20px;
    top: 20px;
    z-index: 10;
    color: white;
    cursor: pointer;
    .title-icon {
      margin-left: 10px;
      cursor: pointer;
    }
    .select-con {
      // background: #eeeeee;
    }
    .select-item {
      cursor: pointer;
      color: grey;
      &:hover {
        color: white;
      }
    }
  }
}
</style>
