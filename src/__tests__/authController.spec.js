import mongoose from "mongoose";
import supertest from "supertest";
import dotenv from "dotenv";
import app from "../app.js";
dotenv.config();

/* Connecting to the database before each test. */
beforeEach(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

/* Closing database connection after each test. */
afterEach(async () => {
  await mongoose.connection.close();
});

describe("POST /api/auth/login", () => {
  it("should login user", async () => {
    const res = await supertest(app).post("/api/auth/login").send({
      username: "suryac72",
      password: "Surya@123",
    });

    expect(res.statusCode).toBe(200);
  });
});
