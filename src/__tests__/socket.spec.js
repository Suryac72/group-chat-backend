import http from "http";
import { Server } from "socket.io";
import { initSocket, getIO } from "../websocket/socket.js";
import { io as clientIo } from "socket.io-client";

let server;
let io;
let clientSocket;

beforeAll((done) => {
  server = http.createServer();
  io = new Server(server);
  initSocket(server);
  server.listen(() => {
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

beforeEach((done) => {
  clientSocket = clientIo(`http://localhost:${server.address().port}`);
  clientSocket.on("connect", () => {
    done();
  });
});

afterEach((done) => {
  clientSocket.close();
  done();
});

describe("Socket.io", () => {

  it("should handle sendMessage and receive newMessage event", (done) => {
    const testGroupId = "testGroupId";
    const testMessage = "Hello, WebSocket!";

    // Listen for newMessage event
    clientSocket.on("newMessage", (message) => {
      expect(message).toEqual(testMessage);
      done();
    });

    // Join the group and send a message
    clientSocket.emit("joinGroup", { groupId: testGroupId });
    clientSocket.emit("sendMessage", {
      groupId: testGroupId,
      message: testMessage,
    });
  });

  
});
