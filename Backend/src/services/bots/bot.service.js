import Bot from "../../models/Bot.js";
import Strategy from "../../models/Strategy.js";
import BotSignal from "../../models/BotSignal.js";

import {
  startBotEngine,
  stopBotEngine,
} from "./bot.engine.js";

const getBots = async (userId) => {
  return Bot.find({
    user: userId,
  })
    .populate(
      "strategy",
      "name strategyType symbol",
    )
    .sort({
      createdAt: -1,
    });
};

const getBotById = async (
  userId,
  botId,
) => {
  return Bot.findOne({
    _id: botId,
    user: userId,
  }).populate(
    "strategy",
    "name strategyType symbol",
  );
};

const createBot = async (
  userId,
  data,
) => {
  const strategy =
    await Strategy.findOne({
      _id: data.strategy,
      user: userId,
    });

  if (!strategy) {
    throw new Error(
      "Strategy not found",
    );
  }

  const bot =
    await Bot.create({
      user: userId,
      strategy: strategy._id,
      name: data.name,
      symbol:
        data.symbol ||
        strategy.symbol,
      instrumentKey:
        data.instrumentKey ||
        strategy.instrumentKey,
      controlMode:
        data.controlMode ||
        "SIGNAL",
      mode: "PAPER",
      quantity:
        Number(data.quantity) || 1,
      timeframe:
        data.timeframe || "5",
      settings: {
        ...data.settings,
        autoExecute:
          data.controlMode ===
          "AUTO",
      },
    });

  return getBotById(
    userId,
    bot._id,
  );
};

const updateBot = async (
  userId,
  botId,
  data,
) => {
  const bot =
    await Bot.findOne({
      _id: botId,
      user: userId,
    });

  if (!bot) {
    throw new Error(
      "Bot not found",
    );
  }

  if (
    bot.status === "RUNNING" &&
    (
      data.strategy ||
      data.symbol ||
      data.instrumentKey ||
      data.quantity
    )
  ) {
    throw new Error(
      "Stop the bot before changing trading configuration",
    );
  }

  if (data.strategy) {
    const strategy =
      await Strategy.findOne({
        _id: data.strategy,
        user: userId,
      });

    if (!strategy) {
      throw new Error(
        "Strategy not found",
      );
    }

    bot.strategy =
      strategy._id;
  }

  if (data.name !== undefined)
    bot.name = data.name;

  if (data.symbol !== undefined)
    bot.symbol = data.symbol;

  if (
    data.instrumentKey !==
    undefined
  )
    bot.instrumentKey =
      data.instrumentKey;

  if (
    data.controlMode !==
    undefined
  ) {
    bot.controlMode =
      data.controlMode;

    bot.settings.autoExecute =
      data.controlMode === "AUTO";
  }

  if (
    data.quantity !==
    undefined
  )
    bot.quantity =
      Number(data.quantity);

  if (
    data.timeframe !==
    undefined
  )
    bot.timeframe =
      data.timeframe;

  if (data.settings) {
    bot.settings = {
      ...bot.settings.toObject(),
      ...data.settings,
    };
  }

  await bot.save();

  return getBotById(
    userId,
    bot._id,
  );
};

const startBot = async (
  userId,
  botId,
) => {
  const bot =
    await Bot.findOne({
      _id: botId,
      user: userId,
    });

  if (!bot) {
    throw new Error(
      "Bot not found",
    );
  }

  if (
    bot.status === "RUNNING"
  ) {
    return bot;
  }

  bot.status = "STARTING";
  bot.errorMessage = null;
  bot.startedAt =
    new Date();

  await bot.save();

  try {
    await startBotEngine(
      bot._id,
    );

    bot.status = "RUNNING";
    await bot.save();
  } catch (error) {
    bot.status = "ERROR";
    bot.errorMessage =
      error.message;
    await bot.save();

    throw error;
  }

  return bot;
};

const pauseBot = async (
  userId,
  botId,
) => {
  const bot =
    await Bot.findOne({
      _id: botId,
      user: userId,
    });

  if (!bot) {
    throw new Error(
      "Bot not found",
    );
  }

  stopBotEngine(
    bot._id,
  );

  bot.status = "PAUSED";

  await bot.save();

  return bot;
};

const stopBot = async (
  userId,
  botId,
) => {
  const bot =
    await Bot.findOne({
      _id: botId,
      user: userId,
    });

  if (!bot) {
    throw new Error(
      "Bot not found",
    );
  }

  stopBotEngine(
    bot._id,
  );

  bot.status = "STOPPED";
  bot.stoppedAt =
    new Date();

  await bot.save();

  return bot;
};

const deleteBot = async (
  userId,
  botId,
) => {
  const bot =
    await Bot.findOne({
      _id: botId,
      user: userId,
    });

  if (!bot) {
    throw new Error(
      "Bot not found",
    );
  }

  stopBotEngine(
    bot._id,
  );

  await BotSignal.deleteMany({
    bot: bot._id,
  });

  await bot.deleteOne();

  return true;
};

const getBotSignals = async (
  userId,
  botId,
) => {
  const bot =
    await Bot.findOne({
      _id: botId,
      user: userId,
    });

  if (!bot) {
    throw new Error(
      "Bot not found",
    );
  }

  return BotSignal.find({
    bot: bot._id,
  })
    .populate(
      "strategy",
      "name strategyType",
    )
    .sort({
      generatedAt: -1,
    })
    .limit(100);
};

export {
  getBots,
  getBotById,
  createBot,
  updateBot,
  startBot,
  pauseBot,
  stopBot,
  deleteBot,
  getBotSignals,
};