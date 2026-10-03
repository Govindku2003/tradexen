import apiRequest from "./apiClient";

const getBots = async () => {
  const response =
    await apiRequest("/bots");

  return response?.data || [];
};

const getBot = async (
  botId,
) => {
  const response =
    await apiRequest(
      `/bots/${botId}`,
    );

  return response?.data;
};

const createBot = async (
  payload,
) => {
  const response =
    await apiRequest("/bots", {
      method: "POST",
      body: JSON.stringify(payload),
    });

  return response?.data;
};

const updateBot = async (
  botId,
  payload,
) => {
  const response =
    await apiRequest(
      `/bots/${botId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

  return response?.data;
};

const startBot = async (
  botId,
) => {
  const response =
    await apiRequest(
      `/bots/${botId}/start`,
      {
        method: "POST",
      },
    );

  return response?.data;
};

const pauseBot = async (
  botId,
) => {
  const response =
    await apiRequest(
      `/bots/${botId}/pause`,
      {
        method: "POST",
      },
    );

  return response?.data;
};

const stopBot = async (
  botId,
) => {
  const response =
    await apiRequest(
      `/bots/${botId}/stop`,
      {
        method: "POST",
      },
    );

  return response?.data;
};

const deleteBot = async (
  botId,
) => {
  return apiRequest(
    `/bots/${botId}`,
    {
      method: "DELETE",
    },
  );
};

const getBotSignals = async (
  botId,
) => {
  const response =
    await apiRequest(
      `/bots/${botId}/signals`,
    );

  return response?.data || [];
};

export {
  getBots,
  getBot,
  createBot,
  updateBot,
  startBot,
  pauseBot,
  stopBot,
  deleteBot,
  getBotSignals,
};