import supertest from "supertest";
import mongoose from "mongoose";
import http from "http"; 
import app from "../app.js";
import { initSocket } from "../websocket/socket.js";
import Group from "../models/groupModel.js";
import User from "../models/userModel.js";
import Message from "../models/messageModel.js";
import dotenv from "dotenv";
dotenv.config();

let server;
let request; 
let token = "";
let userId = "";
let groupId = "";
let messageId = "";

beforeAll(async () => {
  // Create HTTP server
  server = http.createServer(app);
  
  // Initialize socket
  initSocket(server);
  
  // Start listening
  await new Promise((resolve) => {
    server.listen(3001, resolve);
  });

  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);

  // Initialize supertest with the server
  request = supertest(server);

  // Creating a user
  const userResponse = await request.post("/api/users/").send({
    name: "John Doe",
    phoneNo: "1234567890",
    username: "testuser",
    password: "Test@123",
  });

  userId = userResponse.body._id;

  // Log the user in
  const loginResponse = await request.post("/api/auth/login").send({
    username: "testuser",
    password: "Test@123",
  });

  token = loginResponse.body.token;

  // Create a group
  const groupResponse = await request
    .post("/api/groups/")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Test Group" });

  groupId = groupResponse.body._id;
});

afterAll(async () => {
  // Cleanup
  await Message.deleteMany({ group: groupId });
  await Group.findByIdAndDelete(groupId);
  await User.findByIdAndDelete(userId);

  // Close mongoose connection
  await mongoose.connection.close();
  
  // Close the server
  server.close();
});

describe("Message API", () => {
  it("should send a message to the group", async () => {
    const res = await request
      .post("/api/messages/")
      .set("Authorization", `Bearer ${token}`)
      .send({
        groupId,
        content: "Hello, this is a test message",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.content).toBe("Hello, this is a test message");
    expect(res.body.group).toBe(groupId);
    expect(res.body.user).toBe(userId);
    messageId = res.body._id;
  });

  it("should like a message in the group", async () => {
    const res = await request
      .post(`/api/messages/like/${messageId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.likes).toContain(userId);
    expect(res.body.likeCount).toBe(1);
  });

  it("should retrieve messages by group ID", async () => {
    const res = await request
      .get(`/api/messages/group/${groupId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body[0]).toHaveProperty(
      "content",
      "Hello, this is a test message"
    );
  });
});
