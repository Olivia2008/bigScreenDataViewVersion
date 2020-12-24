<template>
  <div class="screen-container" :style="containerStyle">
    <header class="screen-header">
      <div>
        <img :src="borderSrc" alt="" />
      </div>
      <!-- <span class="logo">
        <img src="/static/img/logo_dark.png" alt="" />
      </span> -->
      <span class="title">国家蛋白质科学中心年度实验数据监控系统</span>
      <div class="title-right">
        <img :src="themeSrc" class="qiehuan" @click="handleTheme" />
        <span class="datetime">2021-01-01 00:00:00</span>
      </div>
    </header>
    <div class="screen-body">
      <section class="screen-left">
        <div id="left-top" :class="fullScreenStatus.trend ? 'fullscreen' : ''">
          <trendPage ref="trend"></trendPage>
          <div class="resize" @click="handleResize('trend')">
            <span
              class="iconfont icon-compress-alt"
              v-if="fullScreenStatus.trend"
              >&#xea61;</span
            >
            <span class="iconfont icon-expand-alt" v-else>&#xe655;</span>
          </div>
        </div>
        <div
          id="left-bottom"
          :class="fullScreenStatus.seller ? 'fullscreen' : ''"
        >
          <sellerPage ref="seller"></sellerPage>
          <div class="resize" @click="handleResize('seller')">
            <span
              class="iconfont icon-compress-alt"
              v-if="fullScreenStatus.seller"
              >&#xea61;</span
            >
            <span class="iconfont icon-expand-alt" v-else>&#xe655;</span>
          </div>
        </div>
      </section>
      <section class="screen-middle">
        <div id="middle-top" :class="fullScreenStatus.map ? 'fullscreen' : ''">
          <mapPage ref="map"></mapPage>
          <div class="resize" @click="handleResize('map')">
            <span class="iconfont icon-compress-alt" v-if="fullScreenStatus.map"
              >&#xea61;</span
            >
            <span class="iconfont icon-expand-alt" v-else>&#xe655;</span>
          </div>
        </div>
        <div
          id="middle-bottom"
          :class="fullScreenStatus.rank ? 'fullscreen' : ''"
        >
          <rankPage ref="rank"></rankPage>
          <div class="resize" @click="handleResize('rank')">
            <span
              class="iconfont icon-compress-alt"
              v-if="fullScreenStatus.rank"
              >&#xea61;</span
            >
            <span class="iconfont icon-expand-alt" v-else>&#xe655;</span>
          </div>
        </div>
      </section>
      <section class="screen-right">
        <div id="right-top" :class="fullScreenStatus.hot ? 'fullscreen' : ''">
          <hotPage ref="hot"></hotPage>
          <div class="resize" @click="handleResize('hot')">
            <span class="iconfont icon-compress-alt" v-if="fullScreenStatus.hot"
              >&#xea61;</span
            >
            <span class="iconfont icon-expand-alt" v-else>&#xe655;</span>
          </div>
        </div>
        <div
          id="right-bottom"
          :class="fullScreenStatus.stock ? 'fullscreen' : ''"
        >
          <stockPage ref="stock"></stockPage>
          <div class="resize" @click="handleResize('stock')">
            <span
              class="iconfont icon-compress-alt"
              v-if="fullScreenStatus.stock"
              >&#xea61;</span
            >
            <span class="iconfont icon-expand-alt" v-else>&#xe655;</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<script>
import hotPage from "components/hot.vue";
import mapPage from "components/map.vue";
import rankPage from "components/rank.vue";
import sellerPage from "components/seller.vue";
import stockPage from "components/stock.vue";
import trendPage from "components/trend.vue";
import { mapState } from "vuex";
import { getTheme } from "utils/theme.js";
export default {
  name: "screen",
  components: {
    hotPage,
    mapPage,
    rankPage,
    sellerPage,
    stockPage,
    trendPage
  },
  data() {
    return {
      fullScreenStatus: {
        trend: false,
        seller: false,
        map: false,
        rank: false,
        hot: false,
        stock: false
      },
      params: {
        action: "fullScreen",
        type: "fullScreen",
        name: "",
        value: ""
      }
    };
  },
  created() {
    this.$socket.registerCallBack("fullScreen", this.getData);
    this.$socket.registerCallBack("themeChange", this.themeData);
  },
  methods: {
    handleTheme() {
      this.$socket.send({
        action: "themeChange",
        type: "themeChange",
        name: "",
        value: ""
      });
    },
    themeData() {
      this.$store.commit("changeTheme");
    },
    handleResize(name) {
      // 将当前的全屏状态设置为true
      const val = !this.fullScreenStatus[name];
      this.params.name = name;
      this.params.value = val;
      this.$socket.send(this.params);
    },
    getData(res) {
      // 将当前图表设置为true/false
      this.fullScreenStatus[res.name] = res.value;
      this.$nextTick(() => {
        this.$refs[res.name].resizeChart();
      });
    }
  },
  destroyed() {
    this.$socket.cancelCallBack("fullScreen");
    this.$socket.cancelCallBack("themeChange");
  },
  computed: {
    ...mapState(["theme"]),
    borderSrc() {
      return "static/img/" + getTheme(this.theme).headerBorderSrc;
    },
    themeSrc() {
      return "static/img/" + getTheme(this.theme).themeSrc;
    },
    containerStyle() {
      return {
        backgroundColor: getTheme(this.theme).backgroundColor,
        color: getTheme(this.theme).titleColor
      };
    }
  }
};
</script>
