import { WebSocket } from "ws";
const ws = new WebSocket("wss://172-104-13-126.ip.linodeusercontent.com");
ws.onopen = () => {
  // connection opened
  console.log("connection opened");
};
