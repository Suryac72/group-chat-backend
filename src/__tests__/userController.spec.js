import mongoose from "mongoose";
import supertest from "supertest";
import dotenv from "dotenv";
import app from "../app.js";
import User from "../models/userModel.js";

dotenv.config();

let userId;

/* Connecting to the database before each test. */
beforeEach(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

/* Closing database connection and deleting the created user after each test. */
afterEach(async () => {
  if (userId) {
    await User.findByIdAndDelete(userId);
    userId = null;
  }
  await mongoose.connection.close();
});

describe("POST /api/users/", () => {
  it("should create a new user", async () => {
    const res = await supertest(app).post("/api/users/").send({
      name: "John Doe",
      phoneNo: "1234567890",
      username: "suryac73",
      password: "Surya@123",
    });

    expect(res.statusCode).toBe(201);
    userId = res.body._id;
  });
});

describe("PUT /api/users/:id", () => {
  it("should edit a user", async () => {
    const newUser = await supertest(app).post("/api/users/").send({
      name: "John Doe",
      phoneNo: "1234567890",
      username: "suryac73",
      password: "Surya@123",
    });

    const loginRes = await supertest(app).post("/api/auth/login").send({
      username: "suryac73",
      password: "Surya@123",
    });

    expect(loginRes.statusCode).toBe(200);
    expect(newUser.statusCode).toBe(201);

    userId = newUser.body._id;

    const res = await supertest(app)
      .put(`/api/users/${newUser.body._id}`)
      .set("Authorization", `Bearer ${loginRes.body.token}`)
      .send({
        name: "John Doe Updated",
        phoneNo: "0987654321",
        username: "suryac73",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe("suryac73");
  });
});
