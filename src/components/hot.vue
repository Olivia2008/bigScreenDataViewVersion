<template>
  <div id="singleHot" class="com-container">
    <div class="com-chart" ref="hot"></div>
    <span class="iconfont arr_left" :style="comStyle" @click="toLeft"
      >&#xe602;</span
    >
    <span class="iconfont arr_right" :style="comStyle" @click="toRight"
      >&#xe603;</span
    >
    <span class="cat_name" :style="comStyle">{{ catTitle }}</span>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { getTheme } from "utils/theme.js";
export default {
  name: "singleHot",
  data() {
    return {
      allData: null,
      chartInstance: null,
      currentIndex: 0,
      titleFontSize: 0,
      params: {
        action: "getData",
        type: "hotData",
        name: "hotproduct",
        value: ""
      }
    };
  },
  created() {
    this.$socket.registerCallBack("hotData", this.getData);
  },
  computed: {
    ...mapState(["theme"]),
    catTitle() {
      if (!this.allData) return "";
      else return this.allData[this.currentIndex].name;
    },
    comStyle() {
      return {
        fontSize: this.titleFontSize + "px",
        color: getTheme(this.theme).titleColor
      };
    }
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.hot, this.theme);
      const initOption = {
        title: {
          text: "▎Experiments Percent Distribution",
          top: 20,
          left: 20
        },
        grid: {
          top: "45%",
          left: "3%",
          right: "6%",
          bottom: "3%"
        },
        legend: {
          top: "15%",
          icon: "circle"
        },
        tooltip: {
          show: true,
          formatter: arg => {
            // 名称：12%
            const thirdLevel = arg.data.children;
            let total = 0;
            let toolStr = "";
            thirdLevel.forEach(item => {
              total += item.value;
              toolStr += `
              ${item.name}: ${parseInt((item.value / total) * 100) + "%"}<br/>
              `;
            });
            return toolStr;
          }
        },
        series: [
          {
            type: "pie",
            label: {
              show: false
            },
            labelLine: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                color: "white"
              }
            }
          }
        ]
      };
      this.chartInstance.setOption(initOption);
    },
    updateChart() {
      // pie data
      const seriesData = this.allData[this.currentIndex].children.map(item => {
        return {
          name: item.name,
          value: item.value,
          children: item.children
        };
      });
      // legend
      const legendArr = this.allData[this.currentIndex].children.map(
        item => item.name
      );
      // color
      const colorTotal = [
        ["#096157", "#D1FFFA"],
        ["#163780", "#B6CDFF"],
        ["#065416", "#CFFFD9"],
        ["#776F3C", "#FFFBE3"],
        ["#7D3500", "#FADDC8"],
        ["#7F110F", "#FED2D1"],
        ["#96AA7A", "#E1FFB7"]
      ];
      const legendLen = legendArr.length;
      const colorArr = colorTotal.slice(0, legendLen);
      const updateOption = {
        legend: {
          data: legendArr
        },
        series: [
          {
            data: seriesData,
            itemStyle: {
              color: arg => {
                return {
                  type: "linear",
                  x: 0,
                  y: 1,
                  x2: 0,
                  y2: 0,
                  colorStops: [
                    {
                      offset: 0,
                      color: colorArr[arg.dataIndex][0]
                    },
                    {
                      offset: 1,
                      color: colorArr[arg.dataIndex][1]
                    }
                  ]
                };
              }
            },
            emphasis: {
              label: {
                fontSize: this.titleFontSize * 0.8,
                color: arg => colorArr[arg.dataIndex][1]
              }
            }
          }
        ]
      };
      this.chartInstance.setOption(updateOption);
    },
    getData(res) {
      // const { data: res } = await this.$axios.get("hotproduct");
      this.allData = res;
      this.updateChart();
    },
    resizeChart() {
      this.titleFontSize = (this.$refs.hot.offsetWidth / 100) * 3.6;
      const resizeOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize * 0.6
          }
        },
        series: [
          {
            radius: this.titleFontSize * 4.5,
            center: ["50%", "60%"]
          }
        ]
      };
      this.chartInstance.setOption(resizeOption);
      this.chartInstance.resize();
    },
    toLeft() {
      this.currentIndex--;
      if (this.currentIndex < 0) this.currentIndex = this.allData.length - 1;
      this.updateChart();
    },
    toRight() {
      this.currentIndex++;
      if (this.currentIndex > this.allData.length - 1) this.currentIndex = 0;
      this.updateChart();
    }
  },
  mounted() {
    this.initChart();
    // this.getData();
    this.$socket.send(this.params);
    window.addEventListener("resize", this.resizeChart);
    this.resizeChart();
  },
  destroyed() {
    window.removeEventListener("resize", this.resizeChart);
    this.$socket.cancelCallBack("hotData");
  },
  watch: {
    theme() {
      this.chartInstance.dispose();
      this.initChart();
      this.resizeChart();
      this.updateChart();
    }
  }
};
</script>
<style lang="scss">
#singleHot {
  .arr_left {
    color: white;
    position: absolute;
    left: 10%;
    top: 50%;
    // transform: translateY(-50%);
    cursor: pointer;
  }
  .arr_right {
    position: absolute;
    right: 10%;
    top: 50%;
    // transform: translateY(-50%);
    cursor: pointer;
    color: white;
  }
  .cat_name {
    position: absolute;
    bottom: 20px;
    left: 80%;
    font-weight: bold;
    color: white;
  }
}
</style>
