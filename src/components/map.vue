<template>
  <div id="mapContainer" class="com-container" @dblclick="backChina">
    <div class="com-chart" ref="singleMap"></div>
  </div>
</template>
<script>
import _axios from "axios";
import { getProvinceMapInfo } from "utils/map_utils.js";
import { mapState } from "vuex";
export default {
  name: "mapContainer",
  data() {
    return {
      chartInstance: null,
      allData: null,
      storageProvinceData: {},
      backStatus: false,
      localUrl: "http://localhost:8809",
      params: {
        action: "getData",
        type: "mapdata",
        name: "map",
        value: ""
      }
    };
  },
  created() {
    this.$socket.registerCallBack("mapdata", this.getData);
  },
  methods: {
    async chartInit() {
      this.chartInstance = this.$echarts.init(this.$refs.singleMap, this.theme);
      // 获取本地中国地图矢量数据
      const ret = await _axios.get(this.localUrl + "/static/map/china.json");
      this.$echarts.registerMap("china", ret.data);
      const initOption = {
        title: {
          text: "▎Hospital Distribution",
          left: 20,
          top: 20
        },
        legend: {
          left: "5%",
          bottom: "5%",
          orient: "vertical"
        },
        geo: {
          type: "map",
          map: "china",
          top: "5%",
          bottom: "5%",
          itemStyle: {
            areaColor: "#2E72BF",
            borderColor: "#333"
          }
        }
      };
      this.chartInstance.setOption(initOption);
      this.chartInstance.on("click", async args => {
        // args.name是china.json中的中文名
        // 将中文转化为对应的英文名称
        const obj = getProvinceMapInfo(args.name);
        // 获取本地的对应的省份的矢量数据json
        // 如果当前省份已经缓存过不必再请求数据
        if (obj.key !== undefined) {
          if (!this.storageProvinceData[obj.key]) {
            const provinceData = await _axios.get(this.localUrl + obj.path);
            this.storageProvinceData[obj.key] = provinceData.data;
            console.log(this.storageProvinceData);
            this.$echarts.registerMap(obj.key, provinceData.data);
          }
          const updateProvinceOption = {
            geo: {
              map: obj.key
            }
          };
          this.chartInstance.setOption(updateProvinceOption);
        }
      });
    },
    getData(res) {
      // 后台数据
      // const { data: mapData } = await this.$axios.get("map");
      this.allData = res;
      this.updateChart();
    },
    updateChart() {
      const legendArr = this.allData.map(item => item.name);
      const seriesArr = this.allData.map(item => {
        return {
          type: "effectScatter",
          coordinateSystem: "geo",
          name: item.name,
          data: item.children,
          rippleEffect: {
            // 涟漪
            scale: 5,
            brushType: "fill"
          }
        };
      });
      const updateOption = {
        legend: {
          data: legendArr
        },
        series: seriesArr
      };
      this.chartInstance.setOption(updateOption);
    },
    resizeChart() {
      const titleFontSize = (this.$refs.singleMap.offsetWidth / 100) * 3.6;

      const resizeOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2
          }
        }
      };
      this.chartInstance.setOption(resizeOption);
      // 必有
      this.chartInstance.resize();
    },
    backChina() {
      this.backStatus = true;
      const backChinaOption = {
        geo: {
          map: "china"
        }
      };
      this.chartInstance.setOption(backChinaOption);
    }
  },
  mounted() {
    this.chartInit();
    // this.getData();
    this.$socket.send(this.params);
    window.addEventListener("resize", this.resizeChart);
    this.resizeChart();
  },
  destroyed() {
    this.$socket.cancelCallBack("mapdata");
    window.removeEventListener("resize", this.resizeChart);
  },
  computed: {
    ...mapState(["theme"])
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
