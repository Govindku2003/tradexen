import apiRequest from "./apiClient";

/*
  Fetch current paper-trading positions.

  Backend:
  GET /api/positions
*/
const getPositions = async () => {
  const response = await apiRequest("/positions");

  return response;
};

export { getPositions };
