const getUpstoxWebSocketUrl = async () => {
  const accessToken = process.env.UPSTOX_ANALYTICS_TOKEN;

  if (!accessToken) {
    throw new Error("UPSTOX_ANALYTICS_TOKEN is not configured");
  }

  const response = await fetch(
    "https://api.upstox.com/v3/feed/market-data-feed/authorize",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.errors?.[0]?.message ||
        data?.message ||
        `Upstox WebSocket authorization failed with status ${response.status}`
    );
  }

  const websocketUrl = data?.data?.authorized_redirect_uri;

  if (!websocketUrl) {
    throw new Error(
      "Upstox did not return an authorized WebSocket URL"
    );
  }

  return websocketUrl;
};

export { getUpstoxWebSocketUrl };