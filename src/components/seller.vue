<template>
  <div id="seller" class="com-container">
    <div class="com-chart" ref="seller"></div>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  name: "seller",
  data() {
    return {
      echartsInstance: null,
      allData: null,
      currentPage: 1,
      totalPage: 0,
      timeId: null,
      params: {
        action: "getData",
        type: "sellerdata",
        name: "seller",
        value: ""
      }
    };
  },
  created() {
    this.$socket.registerCallBack("sellerdata", this.getData);
  },
  methods: {
    initChart() {
      this.echartsInstance = this.$echarts.init(this.$refs.seller, this.theme);
      const options = {
        title: {
          text: "▎Individual Annual Experiment Statistics",
          left: 20,
          top: 20
        },
        grid: {
          top: "20%",
          left: "3%",
          right: "6%",
          bottom: "3%",
          containLabel: true
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "line",
            z: 0,
            lineStyle: {
              width: 66,
              color: "#2D3443"
            }
          }
        },
        xAxis: {
          type: "value"
        },
        yAxis: {
          type: "category"
        },
        series: [
          {
            type: "bar",
            barWidth: 66,
            label: {
              show: true,
              position: "right",
              textStyle: {
                color: "white"
              }
            },
            itemStyle: {
              // topLeft->topRight->bottomRight->bottomLeft
              barBorderRadius: [0, 33, 33, 0],
              // topLeft(0,0) topRight(1,0) bottomLeft(0,1) bottomRight(1,1)
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                {
                  offset: 0,
                  color: "#5052EE"
                },
                {
                  offset: 1,
                  color: "#AB6EE5"
                }
              ])
            }
          }
        ]
      };
      this.echartsInstance.setOption(options);
      // mouseover stop, mouseout start
      this.echartsInstance.on("mouseover", () => {
        clearInterval(this.timeId);
      });
      this.echartsInstance.on("mouseout", () => {
        this.startInterval();
      });
    },
    getData(res) {
      // const { data: res } = await this.$axios.get("seller");
      this.allData = res;
      // sort
      this.allData.sort((a, b) => a.value - b.value);
      // 一页显示5条数据
      this.totalPage = Math.ceil(this.allData.length / 5);
      this.updateChart();
      // 定时3000ms
      this.startInterval();
    },
    updateChart() {
      const newData = this.allData.slice(
        (this.currentPage - 1) * 5,
        this.currentPage * 5
      );
      const sellNames = newData.map(item => item.name);
      const sellerValues = newData.map(item => item.value);
      // 加入数据
      const options = {
        yAxis: {
          data: sellNames
        },
        series: [
          {
            data: sellerValues
          }
        ]
      };
      this.echartsInstance.setOption(options);
    },
    startInterval() {
      if (this.timeId) clearInterval(this.timeId);
      this.timeId = setInterval(() => {
        this.currentPage++;
        if (this.currentPage > this.totalPage) this.currentPage = 1;
        this.updateChart();
      }, 3000);
    },
    resizeChart() {
      // resize title font size
      const titleFontSize = (this.$refs.seller.offsetWidth / 100) * 3.6;
      const resizeOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize
            }
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              // topLeft->topRight->bottomRight->bottomLeft
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0]
            }
          }
        ]
      };
      this.echartsInstance.setOption(resizeOption);
      // window resize必须调用echart的resize方法才可生效
      this.echartsInstance.resize();
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
    this.$socket.cancelCallBack("sellerdata");
    clearInterval(this.timeId);
    window.removeEventListener("resize", this.resizeChart);
  },
  computed: {
    ...mapState(["theme"])
  },
  watch: {
    theme() {
      this.echartsInstance.dispose();
      this.initChart();
      this.resizeChart();
      this.updateChart();
    }
  }
};
</script>
<style lang="scss" scoped>
#seller {
}
</style>
