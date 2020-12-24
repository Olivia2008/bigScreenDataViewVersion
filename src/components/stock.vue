<template>
  <div id="multiStock" class="com-container">
    <div class="com-chart" ref="stock"></div>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  name: "mutiStock",
  data() {
    return {
      allData: null,
      chartInstance: null,
      timeId: null,
      currentIndex: 0,
      titleFontSize: 0,
      params: {
        action: "getData",
        type: "stockdata",
        name: "stock",
        value: ""
      }
    };
  },
  created() {
    console.log(this.$socket);
    this.$socket.registerCallBack("stockdata", this.getData);
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.stock, this.theme);
      const centerPointers = [
        ["18%", "40%"],
        ["50%", "40%"],
        ["82%", "40%"],
        ["34%", "75%"],
        ["66%", "75%"]
      ];
      const seriesData = centerPointers.map((item, index) => {
        return {
          type: "pie",
          center: centerPointers[index],
          hoverAnimation: false,
          label: {
            show: true,
            position: "center"
          },
          labelLine: {
            show: false
          }
        };
      });
      const initOption = {
        title: {
          text: "▎Analysis Result",
          left: 20,
          top: 20
        },
        series: seriesData
      };
      this.chartInstance.setOption(initOption);
      // 鼠标事件处理
      this.chartInstance.on("mouseover", () => clearInterval(this.timeId));
      this.chartInstance.on("mouseout", () => this.startInterval(this.timeId));
    },
    getData(res) {
      // const { data: res } = await this.$axios.get("stock");
      this.allData = res;
      this.updateChart();
      this.startInterval();
    },
    updateChart() {
      // 圆环对应的圆心点
      const centerPointers = [
        ["18%", "40%"],
        ["50%", "40%"],
        ["82%", "40%"],
        ["32%", "80%"],
        ["66%", "80%"]
      ];
      // colors
      const colorsArr = [
        ["#4ff778", "#0BA82C"],
        ["#e5dd45", "#E8B11C"],
        ["#E8821C", "#e55445"],
        ["#5052ee", "#ab6ee5"],
        ["#23e5e5", "#2e72bf"]
      ];
      // 切换动画
      const start = this.currentIndex * 5;
      const end = (this.currentIndex + 1) * 5;
      // 先显示前5条数据
      const showData = this.allData.slice(start, end);
      const innerRadius = this.titleFontSize * 3.2;
      const outterRadius = innerRadius * 1.2;
      const seriesData = showData.map((item, index) => {
        return {
          type: "pie",
          center: centerPointers[index],
          radius: [outterRadius, innerRadius],
          label: {
            // label的显示与否与data中的name关联
            show: true,
            position: "center",
            color: colorsArr[index][0],
            fontSize: this.titleFontSize * 0.8
          },
          labelLine: {
            show: false
          },
          data: [
            {
              name: item.name + "\n\n" + "Gene:" + item.sales + "\n\n" + "Protain:" + item.stock,
              value: item.sales,
              itemStyle: {
                // bottomLeft -->topLeft
                color: {
                  type: "linear",
                  x: 0,
                  y: 1,
                  x2: 0,
                  y2: 0,
                  colorStops: [
                    {
                      offset: 0,
                      color: colorsArr[index][0]
                    },
                    {
                      offset: 1,
                      color: colorsArr[index][1]
                    }
                  ]
                }
              }
            },
            {
              value: item.stock,
              itemStyle: {
                color: "#333833"
              }
            }
          ],
          hoverAnimation: false
        };
      });
      const updateOption = {
        series: seriesData
      };
      this.chartInstance.setOption(updateOption);
    },
    resizeChart() {
      this.titleFontSize = (this.$refs.stock.offsetWidth / 100) * 3.6;
      const innerRadius = this.titleFontSize * 2;
      const outterRadius = innerRadius * 1.125;
      const resizeOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        series: [
          {
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: this.titleFontSize / 2
            }
          },
          {
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: this.titleFontSize / 2
            }
          },
          {
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: this.titleFontSize / 2
            }
          },
          {
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: this.titleFontSize / 2
            }
          },
          {
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: this.titleFontSize / 2
            }
          }
        ]
      };
      this.chartInstance.setOption(resizeOption);
      this.chartInstance.resize();
    },
    startInterval() {
      if (this.timeId) clearInterval(this.timeId);
      this.timeId = setInterval(() => {
        this.currentIndex++;
        if (this.currentIndex > 1) this.currentIndex = 0;
        this.updateChart();
      }, 3000);
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
    clearInterval(this.timeId);
    this.$socket.cancelCallBack("stockdata");
    window.removeEventListener("resize", this.resizeChart);
  },
  computed: {
    ...mapState(["theme"])
  },
  watch: {
    theme() {
      this.chartInstance.dispose();
      this.initChart();
      this.$socket.send(this.params);
      this.resizeChart();
      this.updateChart();
    }
  }
};
</script>
