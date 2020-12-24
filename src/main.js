import Vue from "vue";
// import "./plugins/axios";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "assets/css/global.scss";
import "assets/font/iconfont.css";
import _axios from "axios";
import SocketService from "utils/websocket_service";
// import * as echarts from "echarts";
// import "../public/static/theme/chalk.js";

_axios.defaults.baseURL = "http://127.0.0.1:8889";
Vue.prototype.$axios = _axios;
// 连接服务器
SocketService.Instance.connect();
Vue.prototype.$socket = SocketService.Instance;

Vue.prototype.$echarts = window.echarts;

Vue.config.productionTip = false;
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
