import Alert from "../../models/Alert.js";

const createAlert = async ({
  userId,
  botId = null,
  strategyId = null,
  type,
  severity = "INFO",
  title,
  message,
  metadata = {},
}) => {
  if (!userId) {
    throw new Error("Alert userId is required");
  }

  if (!type) {
    throw new Error("Alert type is required");
  }

  if (!title || !message) {
    throw new Error(
      "Alert title and message are required",
    );
  }

  return Alert.create({
    user: userId,
    bot: botId,
    strategy: strategyId,
    type,
    severity,
    title,
    message,
    metadata,
  });
};

const getAlerts = async ({
  userId,
  unreadOnly = false,
  limit = 50,
  skip = 0,
}) => {
  const query = {
    user: userId,
  };

  if (unreadOnly) {
    query.isRead = false;
  }

  const safeLimit = Math.min(
    Math.max(Number(limit) || 50, 1),
    100,
  );

  const safeSkip = Math.max(
    Number(skip) || 0,
    0,
  );

  const [alerts, total, unread] =
    await Promise.all([
      Alert.find(query)
        .populate(
          "bot",
          "name symbol status",
        )
        .populate(
          "strategy",
          "name strategyType",
        )
        .sort({ createdAt: -1 })
        .skip(safeSkip)
        .limit(safeLimit)
        .lean(),

      Alert.countDocuments(query),

      Alert.countDocuments({
        user: userId,
        isRead: false,
      }),
    ]);

  return {
    alerts,
    unread,
    pagination: {
      total,
      limit: safeLimit,
      skip: safeSkip,
      hasMore:
        safeSkip + alerts.length < total,
    },
  };
};

const markAlertRead = async (
  userId,
  alertId,
) => {
  const alert =
    await Alert.findOneAndUpdate(
      {
        _id: alertId,
        user: userId,
      },
      {
        $set: {
          isRead: true,
        },
      },
      {
        new: true,
      },
    );

  if (!alert) {
    throw new Error("Alert not found");
  }

  return alert;
};

const markAllAlertsRead = async (
  userId,
) => {
  const result =
    await Alert.updateMany(
      {
        user: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      },
    );

  return {
    updated: result.modifiedCount,
  };
};

export {
  createAlert,
  getAlerts,
  markAlertRead,
  markAllAlertsRead,
};