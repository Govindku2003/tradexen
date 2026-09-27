import dotenv from "dotenv";

dotenv.config();

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongodbUri: process.env.MONGODB_URI,

  jwtSecret: process.env.JWT_SECRET,
jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};

export default env;