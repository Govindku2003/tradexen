import User from "../models/User.js";
import TradingAccount from "../models/TradingAccount.js";

import {
  createTradingAccount,
} from "../services/tradingAccount.service.js";

import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../utils/auth.js";

/*
|--------------------------------------------------------------------------
| SIGNUP
|--------------------------------------------------------------------------
*/
const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
    } = req.body;

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

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const normalizedPhone =
      phone?.trim() || null;

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    const hashedPassword =
      await hashPassword(password);

    /*
     * Create user
     */
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
    });

    /*
     * Create paper trading account
     */
    const tradingAccount =
      await createTradingAccount(user._id);

    /*
     * Signup does NOT log the user in.
     *
     * User must login after signup.
     */
    return res.status(201).json({
      success: true,
      message:
        "Account created successfully. Please login to continue.",

      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
        },

        tradingAccount: {
          id: tradingAccount.account._id,
          accountType:
            tradingAccount.account.accountType,
          initialBalance:
            tradingAccount.account.initialBalance,
          availableBalance:
            tradingAccount.account.availableBalance,
          investedAmount:
            tradingAccount.account.investedAmount,
          currency:
            tradingAccount.account.currency,
          status:
            tradingAccount.account.status,
        },
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

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/
const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

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

    const isPasswordValid =
      await comparePassword(
        password,
        user.password,
      );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    /*
     * Update real login time
     */
    user.lastLogin = new Date();

    await user.save();

    /*
     * IMPORTANT:
     *
     * Existing users may have been created before
     * TradingAccount creation was added to signup.
     *
     * Therefore, login automatically creates the
     * missing paper trading account if required.
     */
    const accountResult =
      await createTradingAccount(user._id);

    const tradingAccount =
      accountResult.account;

    /*
     * Generate JWT
     */
    const token =
      generateToken(user._id.toString());

    return res.status(200).json({
      success: true,
      message: "Login successful",

      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
        },

        tradingAccount: tradingAccount
          ? {
              id: tradingAccount._id,
              accountType:
                tradingAccount.accountType,
              initialBalance:
                tradingAccount.initialBalance,
              availableBalance:
                tradingAccount.availableBalance,
              investedAmount:
                tradingAccount.investedAmount,
              currency:
                tradingAccount.currency,
              status:
                tradingAccount.status,
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

/*
|--------------------------------------------------------------------------
| CURRENT AUTHENTICATED USER
|--------------------------------------------------------------------------
*/
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.userId,
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /*
     * Self-heal account for old users
     */
    const accountResult =
      await createTradingAccount(user._id);

    const tradingAccount =
      accountResult.account;

    return res.status(200).json({
      success: true,

      data: {
        user,

        tradingAccount: tradingAccount
          ? {
              id: tradingAccount._id,
              accountType:
                tradingAccount.accountType,
              initialBalance:
                tradingAccount.initialBalance,
              availableBalance:
                tradingAccount.availableBalance,
              investedAmount:
                tradingAccount.investedAmount,
              currency:
                tradingAccount.currency,
              status:
                tradingAccount.status,
              createdAt:
                tradingAccount.createdAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch user",
    });
  }
};

export {
  signup,
  login,
  getCurrentUser,
};