import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { body, validationResult, param } from "express-validator";


// Create User Controller
export async function createUser(req, res) {
  try {
    // Validation
    await body("name").notEmpty().withMessage("Name is required").run(req);
    await body("phoneNo")
      .isMobilePhone()
      .withMessage("Invalid phone number")
      .run(req);
    await body("username")
      .notEmpty()
      .withMessage("Username is required")
      .run(req);
    await body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: errors.array().map((err) => err.msg) });
    }

    const { name, phoneNo, username, password, isAdmin } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    const user = new User({
      name,
      phoneNo,
      username,
      password: hashedPassword,
      isAdmin,
    });
    await user.save();

    res.status(201).json(user);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "An error occurred while creating the user",
        error: error.message,
      });
  }
}


// Edit User Controller
export async function editUser(req, res) {
  try {
    // Validation
    await param("id").isMongoId().withMessage("Invalid user ID").run(req);
    await body("name")
      .optional()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .run(req);
    await body("phoneNo")
      .optional()
      .isMobilePhone()
      .withMessage("Invalid phone number")
      .run(req);
    await body("username")
      .optional()
      .notEmpty()
      .withMessage("Username cannot be empty")
      .run(req);
    await body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .run(req);
    await body("isAdmin")
      .optional()
      .isBoolean()
      .withMessage("isAdmin must be a boolean value")
      .run(req);

    const errors = validationResult(req);
    console.log(errors.array())
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: errors.array().map((err) => err.msg) });
    }

    const { id } = req.params;
    const { name, phoneNo, username, password, isAdmin } = req.body;
    const hashedPassword = password ? bcrypt.hashSync(password, 8) : undefined;

    const user = await User.findByIdAndUpdate(
      id,
      { name, phoneNo, username, password: hashedPassword, isAdmin },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "An error occurred while editing the user",
        error: error.message,
      });
  }
}
