import User from "../models/User.js";
import TradingAccount from "../models/TradingAccount.js";
import { hashPassword, comparePassword, generateToken } from "../utils/auth.js";

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await hashPassword(password);

    // 1. Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // 2. Automatically create paper trading account
    const tradingAccount = await TradingAccount.create({
      user: user._id,
      accountType: "paper",
      initialBalance: 1000000,
      availableBalance: 1000000,
      investedAmount: 0,
      currency: "INR",
      status: "active",
    });

    // 3. Generate JWT
    const token = generateToken(user._id.toString());

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        tradingAccount: {
          id: tradingAccount._id,
          accountType: tradingAccount.accountType,
          initialBalance: tradingAccount.initialBalance,
          availableBalance: tradingAccount.availableBalance,
          investedAmount: tradingAccount.investedAmount,
          currency: tradingAccount.currency,
          status: tradingAccount.status,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    // Find user's trading account
    const tradingAccount = await TradingAccount.findOne({
      user: user._id,
    });

    const token = generateToken(user._id.toString());

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        tradingAccount: tradingAccount
          ? {
              id: tradingAccount._id,
              accountType: tradingAccount.accountType,
              initialBalance: tradingAccount.initialBalance,
              availableBalance: tradingAccount.availableBalance,
              investedAmount: tradingAccount.investedAmount,
              currency: tradingAccount.currency,
              status: tradingAccount.status,
            }
          : null,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const tradingAccount = await TradingAccount.findOne({
      user: user._id,
    });

    return res.status(200).json({
      success: true,
      data: {
        user,
        tradingAccount: tradingAccount
          ? {
              id: tradingAccount._id,
              accountType: tradingAccount.accountType,
              initialBalance: tradingAccount.initialBalance,
              availableBalance: tradingAccount.availableBalance,
              investedAmount: tradingAccount.investedAmount,
              currency: tradingAccount.currency,
              status: tradingAccount.status,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch user",
    });
  }
};

export { signup, login, getCurrentUser };
