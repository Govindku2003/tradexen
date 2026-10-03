import User from "../../models/User.js";
import TradingAccount from "../../models/TradingAccount.js";
import Position from "../../models/Position.js";
import Order from "../../models/Order.js";
import Trade from "../../models/Trade.js";
import Portfolio from "../../models/Portfolio.js";

const calculatePercentage = (value, base) => {
  if (!Number.isFinite(Number(base)) || Number(base) === 0) {
    return 0;
  }

  return (Number(value) / Number(base)) * 100;
};

const startOfToday = () => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date;
};

const calculatePortfolio = async ({ userId }) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  /*
   * ----------------------------------------------------
   * 1. AUTHENTICATED USER
   * ----------------------------------------------------
   */
  const user = await User.findById(userId)
    .select("-password")
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  /*
   * ----------------------------------------------------
   * 2. ACTIVE TRADING ACCOUNT
   * ----------------------------------------------------
   */
  const tradingAccount = await TradingAccount.findOne({
    user: userId,
    status: "active",
  }).lean();

  if (!tradingAccount) {
    throw new Error("Active trading account not found");
  }

  /*
   * ----------------------------------------------------
   * 3. OPEN POSITIONS
   * ----------------------------------------------------
   */
  const positions = await Position.find({
    user: userId,
    tradingAccount: tradingAccount._id,
    status: "OPEN",
    quantity: { $gt: 0 },
  })
    .sort({ createdAt: -1 })
    .lean();

  /*
   * ----------------------------------------------------
   * 4. INVESTED + MARKET VALUE + UNREALIZED P&L
   * ----------------------------------------------------
   */
  const holdings = positions.map((position) => {
    const quantity = Number(position.quantity) || 0;

    const averageEntryPrice =
      Number(position.averageEntryPrice) || 0;

    const currentPrice =
      Number(position.currentPrice) || averageEntryPrice;

    const investedValue = quantity * averageEntryPrice;

    const marketValue = quantity * currentPrice;

    let unrealizedPnL;

    if (position.side === "SHORT") {
      unrealizedPnL =
        (averageEntryPrice - currentPrice) * quantity;
    } else {
      unrealizedPnL =
        (currentPrice - averageEntryPrice) * quantity;
    }

    const pnlPercent = calculatePercentage(
      unrealizedPnL,
      investedValue,
    );

    return {
      id: position._id,
      symbol: position.symbol,
      exchange: position.exchange,
      side: position.side,
      quantity,
      averageEntryPrice,
      currentPrice,
      investedValue,
      marketValue,
      unrealizedPnL,
      pnlPercent,
      stopLoss: position.stopLoss,
      takeProfit: position.takeProfit,
      openedAt: position.openedAt,
    };
  });

  const investedValue = holdings.reduce(
    (total, item) => total + item.investedValue,
    0,
  );

  const marketValue = holdings.reduce(
    (total, item) => total + item.marketValue,
    0,
  );

  const unrealizedPnL = holdings.reduce(
    (total, item) => total + item.unrealizedPnL,
    0,
  );

  /*
   * ----------------------------------------------------
   * 5. TRADES / REALIZED P&L
   * ----------------------------------------------------
   */
  const trades = await Trade.find({
    user: userId,
    tradingAccount: tradingAccount._id,
  })
    .sort({ executedAt: -1 })
    .limit(100)
    .lean();

  const realizedPnL = trades.reduce(
    (total, trade) =>
      total + (Number(trade.realizedPnL) || 0),
    0,
  );

  const today = startOfToday();

  const todayTrades = trades.filter((trade) => {
    if (!trade.executedAt) {
      return false;
    }

    return new Date(trade.executedAt) >= today;
  });

  const todayRealizedPnL = todayTrades.reduce(
    (total, trade) =>
      total + (Number(trade.realizedPnL) || 0),
    0,
  );

  /*
   * ----------------------------------------------------
   * 6. TOTAL P&L
   * ----------------------------------------------------
   */
  const totalPnL = realizedPnL + unrealizedPnL;

  /*
   * Current portfolio value:
   *
   * Available cash + current market value
   */
  const cashBalance =
    Number(tradingAccount.availableBalance) || 0;

  const totalValue = cashBalance + marketValue;

  /*
   * ----------------------------------------------------
   * 7. ORDERS
   * ----------------------------------------------------
   */
  const orders = await Order.find({
    user: userId,
    tradingAccount: tradingAccount._id,
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  /*
   * ----------------------------------------------------
   * 8. PORTFOLIO SNAPSHOT
   * ----------------------------------------------------
   */
  const portfolio = await Portfolio.findOneAndUpdate(
    {
      user: userId,
    },
    {
      user: userId,
      tradingAccount: tradingAccount._id,
      totalValue,
      cashBalance,
      investedValue,
      totalPnL,
      todayPnL: todayRealizedPnL,
      totalPnLPercent: calculatePercentage(
        totalPnL,
        tradingAccount.initialBalance,
      ),
      todayPnLPercent: calculatePercentage(
        todayRealizedPnL,
        tradingAccount.initialBalance,
      ),
      lastUpdated: new Date(),
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  ).lean();

  /*
   * ----------------------------------------------------
   * 9. RESPONSE
   * ----------------------------------------------------
   */
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,

      // User model currently doesn't contain phone.
      phone: user.phone || null,
    },

    tradingAccount: {
      id: tradingAccount._id,
      accountType: tradingAccount.accountType,
      initialBalance: tradingAccount.initialBalance,
      availableBalance: tradingAccount.availableBalance,
      investedAmount: investedValue,
      currency: tradingAccount.currency,
      status: tradingAccount.status,
      createdAt: tradingAccount.createdAt,
    },

 portfolio: {
  id: portfolio?._id,

  totalValue,
  cashBalance,
  investedValue,
  marketValue,

  totalPnL,
  todayPnL: todayRealizedPnL,

  realizedPnL,
  unrealizedPnL,

  totalPnLPercent: calculatePercentage(
    totalPnL,
    tradingAccount.initialBalance,
  ),

  todayPnLPercent: calculatePercentage(
    todayRealizedPnL,
    tradingAccount.initialBalance,
  ),

  positionCount: holdings.length,

  lastUpdated: portfolio?.lastUpdated || new Date(),
},

    holdings,

    activity: {
      totalOrders: await Order.countDocuments({
        user: userId,
        tradingAccount: tradingAccount._id,
      }),

      totalTrades: await Trade.countDocuments({
        user: userId,
        tradingAccount: tradingAccount._id,
      }),

      openPositions: holdings.length,

      recentOrders: orders,

      recentTrades: trades.slice(0, 10),
    },
  };
};

export { calculatePortfolio };