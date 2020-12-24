<template>
  <div id="rankBarChart" class="com-container">
    <div class="com-chart" ref="rank"></div>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  name: "rankBarChart",
  data() {
    return {
      chartInstance: null,
      allData: null,
      // 平移动画起始结束初值
      startVal: 2,
      endVal: 12,
      params: {
        action: "getData",
        type: "rankdata",
        name: "rank",
        value: ""
      }
    };
  },
  created() {
    this.$socket.registerCallBack("rankdata", this.getData);
  },
  methods: {
    iniChart() {
      this.chartInstance = this.$echarts.init(this.$refs.rank, this.theme);
      const initOption = {
        title: {
          text: "▎Hospital Cases Rank",
          left: 20,
          top: 20
        },
        grid: {
          top: "35%",
          left: "5%",
          bottom: "5%",
          right: "5%",
          containLabel: true
        },
        tooltip: {
          show: true
        },
        xAxis: {
          type: "category"
        },
        yAxis: {
          type: "value"
        },
        series: [
          {
            type: "bar"
          }
        ]
      };
      this.chartInstance.setOption(initOption);
      this.chartInstance.on("mouseover", () => clearInterval(this.timeId));
      this.chartInstance.on("mouseout", () => this.startInterval());
    },
    updateChart() {
      const xAxisData = this.allData.map(item => item.name);
      const yAxisData = this.allData.map(item => item.value);
      const colorArr = [
        ["#07651A", "#4FF778"],
        ["#2E72BF", "#23E5E5"],
        ["#5052EE", "#AB6EE5"]
      ];

      const updateOption = {
        dataZoom: {
          show: true,
          startValue: this.startVal,
          endValue: this.endVal,
          timeId: null
        },
        xAxis: {
          data: xAxisData
        },
        series: [
          {
            data: yAxisData,
            // 300以上，colorArr1[0] 200以上colorArr1[1]及200以下colorArr1[2]划分颜色
            itemStyle: {
              color: arg => {
                let newColorArr = colorArr[0];
                if (arg.value >= 300) newColorArr = colorArr[0];
                else if (arg.value >= 200) newColorArr = colorArr[1];
                else newColorArr = colorArr[2];
                // 颜色从bottomLeft-->topLeft
                return {
                  type: "linear",
                  x: 0,
                  y: 1,
                  x2: 0,
                  y2: 0,
                  colorStops: [
                    {
                      offset: 0,
                      color: newColorArr[0]
                    },
                    {
                      offset: 1,
                      color: newColorArr[1]
                    }
                  ]
                };
              }
            }
          }
        ]
      };
      this.chartInstance.setOption(updateOption);
    },
    getData(res) {
      // const { data: res } = await this.$axios.get("rank");
      this.allData = res;
      this.allData.sort((a, b) => {
        return b.value - a.value;
      });
      this.updateChart();
      this.startInterval();
    },
    resizeChart() {
      const titleFontSize = (this.$refs.rank.offsetWidth / 100) * 3.6;

      const resizeOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0]
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
        this.startVal++;
        this.endVal++;
        if (this.endVal > this.allData.length - 1) {
          this.startVal = 0;
          this.endVal = 9;
        }
        this.updateChart();
      }, 2000);
    }
  },
  mounted() {
    this.iniChart();
    // this.getData();
    this.$socket.send(this.params);
    window.addEventListener("resize", this.resizeChart);
    this.resizeChart();
  },
  destroyed() {
    this.$socket.cancelCallBack("rankdata");
    window.removeEventListener("resize", this.resizeChart);
    clearInterval(this.timeId);
  },
  computed: {
    ...mapState(["theme"])
  },
  watch: {
    theme() {
      this.chartInstance.dispose();
      this.iniChart();
      this.resizeChart();
      this.updateChart();
    }
  }
};
</script>
