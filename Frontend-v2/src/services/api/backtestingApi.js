const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const runBacktest = async (payload) => {
  const response = await fetch(
    `${API_BASE_URL}/api/backtesting/run`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Failed to run backtest"
    );
  }

  return result.data;
};

export { runBacktest };