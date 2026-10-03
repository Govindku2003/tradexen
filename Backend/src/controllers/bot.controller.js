import {
  getBots,
  getBotById,
  createBot,
  updateBot,
  startBot,
  pauseBot,
  stopBot,
  deleteBot,
  getBotSignals,
} from "../services/bots/bot.service.js";

const listBots = async (
  req,
  res,
) => {
  try {
    const bots =
      await getBots(req.userId);

    return res.json({
      success: true,
      data: bots,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBot = async (
  req,
  res,
) => {
  try {
    const bot =
      await getBotById(
        req.userId,
        req.params.botId,
      );

    if (!bot) {
      return res.status(404).json({
        success: false,
        message: "Bot not found",
      });
    }

    return res.json({
      success: true,
      data: bot,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createBotController =
  async (req, res) => {
    try {
      const bot =
        await createBot(
          req.userId,
          req.body,
        );

      return res.status(201).json({
        success: true,
        data: bot,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

const updateBotController =
  async (req, res) => {
    try {
      const bot =
        await updateBot(
          req.userId,
          req.params.botId,
          req.body,
        );

      return res.json({
        success: true,
        data: bot,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

const startBotController =
  async (req, res) => {
    try {
      const bot =
        await startBot(
          req.userId,
          req.params.botId,
        );

      return res.json({
        success: true,
        message:
          "Bot started successfully",
        data: bot,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

const pauseBotController =
  async (req, res) => {
    try {
      const bot =
        await pauseBot(
          req.userId,
          req.params.botId,
        );

      return res.json({
        success: true,
        message:
          "Bot paused successfully",
        data: bot,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

const stopBotController =
  async (req, res) => {
    try {
      const bot =
        await stopBot(
          req.userId,
          req.params.botId,
        );

      return res.json({
        success: true,
        message:
          "Bot stopped successfully",
        data: bot,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

const deleteBotController =
  async (req, res) => {
    try {
      await deleteBot(
        req.userId,
        req.params.botId,
      );

      return res.json({
        success: true,
        message:
          "Bot deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

const getBotSignalsController =
  async (req, res) => {
    try {
      const signals =
        await getBotSignals(
          req.userId,
          req.params.botId,
        );

      return res.json({
        success: true,
        data: signals,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export {
  listBots,
  getBot,
  createBotController,
  updateBotController,
  startBotController,
  pauseBotController,
  stopBotController,
  deleteBotController,
  getBotSignalsController,
};