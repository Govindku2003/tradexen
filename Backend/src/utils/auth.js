import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

const hashPassword = async (password) => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

export {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
};