import apiRequest from "./apiClient";

const getPortfolio = async () => {
  return apiRequest("/portfolio");
};

export { getPortfolio };