import apiRequest from "./apiClient";

const getStrategies = async () => {
  const response =
    await apiRequest("/strategy");

  return response?.data || [];
};

const createStrategy = async (
  payload,
) => {
  const response =
    await apiRequest("/strategy", {
      method: "POST",
      body: JSON.stringify(payload),
    });

  return response?.data;
};

const updateStrategy = async (
  strategyId,
  payload,
) => {
  const response =
    await apiRequest(
      `/strategy/${strategyId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

  return response?.data;
};

const deleteStrategy = async (
  strategyId,
) => {
  return apiRequest(
    `/strategy/${strategyId}`,
    {
      method: "DELETE",
    },
  );
};

const toggleStrategy = async (
  strategyId,
) => {
  const response =
    await apiRequest(
      `/strategy/${strategyId}/toggle`,
      {
        method: "PATCH",
      },
    );

  return response?.data;
};

const getStrategySignals = async ({
  instrumentKey,
  unit = "minutes",
  interval = "5",
  from,
  to,
}) => {
  const params =
    new URLSearchParams();

  params.set(
    "instrumentKey",
    instrumentKey,
  );

  params.set("unit", unit);
  params.set("interval", interval);

  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const response =
    await apiRequest(
      `/strategy/signals?${params.toString()}`,
    );

  return response?.data;
};

export {
  getStrategies,
  createStrategy,
  updateStrategy,
  deleteStrategy,
  toggleStrategy,
  getStrategySignals,
};