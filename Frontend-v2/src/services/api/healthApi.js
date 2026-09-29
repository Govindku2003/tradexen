import apiRequest from "./apiClient";

const getHealth = async () => {
  return apiRequest("/health");
};

export { getHealth };