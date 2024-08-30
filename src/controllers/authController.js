import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import generateToken from '../utils/jwt.js';
import { body, validationResult } from 'express-validator';


export async function login(req, res) {
  try {
    // Validation
    await body('username').notEmpty().withMessage('Username is required').run(req);
    await body('password').notEmpty().withMessage('Password is required').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array().map(err => err.msg) });
    }

    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An error occurred during login', error: error.message });
  }
}
