export default class SocketService {
  static _instance = null;
  static get Instance() {
    if (!this._instance) this._instance = new SocketService();
    return this._instance;
  }
  // 和服务器连接的socket对象
  ws = null;

  // 存储获取的数据
  objData = {};

  // 是否连接成功的状态
  state = false;

  // 发送服务器请求的次数
  count = 0;

  // 重新连接的次数
  retryCount = 0;

  // 监听连接服务器的方法
  connect() {
    if (!window.WebSocket) return console.log("您的浏览器不支持Websocket！");
    this.ws = new WebSocket("ws://localhost:8808");
    // 连接成功
    this.ws.onopen = () => {
      console.log("服务器连接成功");
      this.state = true;
      // 重置请求次数
      this.retryCount = 0;
    };

    // 连接失败, 或连接成功后服务器关闭
    this.ws.onclose = () => {
      console.log("服务器连接失败！");
      this.state = false;
      this.retryCount++;
      // 每发送一次请求延长一次时间
      setTimeout(() => {
        this.connect();
      }, 500 * this.retryCount);
    };

    // 服务器发来的数据
    this.ws.onmessage = msg => {
      // console.log(msg);
      // 处理服务端发来的数据
      const resData = JSON.parse(msg.data);
      const type = resData.type;
      // 给objData添加key, value
      if (this.objData[type]) {
        const action = resData.action;
        switch (action) {
          case "getData":
            this.objData[type].call(this, JSON.parse(resData.data));
            break;
          case "fullScreen":
            this.objData[type].call(this, resData);
            break;
          case "themeChange":
            this.objData[type].call(this, resData);
            break;
        }
        console.log(this.objData);
      }
    };
  }

  // 注册回调
  registerCallBack(type, callBack) {
    this.objData[type] = callBack;
  }
  // 注销回调
  cancelCallBack(type) {
    this.objData[type] = null;
  }
  // 向服务器发送数据
  send(data) {
    // 连接服务器成功发送请求参数
    if (this.state) {
      this.count = 0;
      this.ws.send(JSON.stringify(data));
    } else {
      // 连接失败，请求次数增加，重新请求，延长请求时间
      this.count++;
      setTimeout(() => {
        this.send(data);
      }, 500 * this.count);
    }
  }
}
