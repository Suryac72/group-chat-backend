import supertest from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import Group from "../models/groupModel.js";
import User from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

let token = "";
let userId = "";
let memberId = "";
let secondMemberId = "";

/* Setup: Connecting to the database and creating a user for authentication */
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const userResponse = await supertest(app).post("/api/users/").send({
    name: "John Doe",
    phoneNo: "1234567890",
    username: "testuser",
    password: "Test@123",
  });

  const memberToBeAdded = await supertest(app).post("/api/users/").send({
    name: "John Doe",
    phoneNo: "0987654321",
    username: "testuser1",
    password: "Test@123",
  });

  const secondMember = await supertest(app).post("/api/users/").send({
    name: "John Doe",
    phoneNo: "0987654321",
    username: "testuser2",
    password: "Test@123",
  });

  userId = userResponse.body._id;
  memberId = memberToBeAdded.body._id;
  secondMemberId = secondMember.body._id;

  const loginResponse = await supertest(app).post("/api/auth/login").send({
    username: "testuser",
    password: "Test@123",
  });
  token = loginResponse.body.token;
});

/* Cleanup: Deleting created data and closing database connection after tests */
afterAll(async () => {
  await User.findByIdAndDelete(userId);
  await User.findByIdAndDelete(memberId);
  await User.findByIdAndDelete(secondMemberId);
  await Group.deleteMany({}); 
  await mongoose.connection.close();
});

describe("Group API", () => {
  let groupId = "";

  it("should create a new group", async () => {
    const res = await supertest(app)
      .post("/api/groups/")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Group" });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Test Group");
    groupId = res.body._id;
  });

  it("should add a member to the group", async () => {
    const res = await supertest(app)
      .post("/api/groups/addMember")
      .set("Authorization", `Bearer ${token}`)
      .send({ groupId, userId: memberId });

    expect(res.statusCode).toBe(200);
    expect(res.body.members).toContain(memberId);
  });

  it("should add an admin to the group", async () => {
    const res = await supertest(app)
      .post("/api/groups/addAdmin")
      .set("Authorization", `Bearer ${token}`)
      .send({ groupId, userId: memberId });
    expect(res.statusCode).toBe(200);
    expect(res.body.admins).toContain(memberId);
  });

  it("should search for groups", async () => {
    const res = await supertest(app)
      .get("/api/groups/search")
      .set("Authorization", `Bearer ${token}`)
      .query({ query: "Test" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("should remove a member from the group", async () => {
    const addMember = await supertest(app)
      .post("/api/groups/addMember")
      .set("Authorization", `Bearer ${token}`)
      .send({ groupId, userId: secondMemberId });

    expect(addMember.statusCode).toBe(200);

    const res = await supertest(app)
      .post("/api/groups/removeMember")
      .set("Authorization", `Bearer ${token}`)
      .send({ groupId, userId: secondMemberId });

    expect(res.statusCode).toBe(200);
    expect(res.body.members).not.toContain(secondMemberId);
  });

  it("should remove an admin from the group", async () => {
    const res = await supertest(app)
      .post("/api/groups/removeAdmin")
      .set("Authorization", `Bearer ${token}`)
      .send({ groupId, userId: memberId });

    expect(res.statusCode).toBe(200);
    expect(res.body.admins).not.toContain(memberId);
  });

  it("should delete a group", async () => {
    const res = await supertest(app)
      .delete(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(204);
  });
});
