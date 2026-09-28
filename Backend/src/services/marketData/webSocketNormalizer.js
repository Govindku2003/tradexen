const normalizeWebSocketFeed = (decodedMessage) => {
  if (!decodedMessage?.feeds) {
    return null;
  }

  const normalizedFeeds = [];

  for (const [instrumentKey, feed] of Object.entries(
    decodedMessage.feeds
  )) {
    const ltpc = feed?.ltpc;

    if (!ltpc) {
      continue;
    }

    normalizedFeeds.push({
      instrumentKey,
      price: ltpc.ltp ?? null,
      previousClose: ltpc.cp ?? null,
      lastTradedTime: ltpc.ltt
        ? new Date(Number(ltpc.ltt)).toISOString()
        : null,
    });
  }

  return {
    type: decodedMessage.type || "live_feed",
    currentTimestamp: decodedMessage.currentTs
      ? new Date(Number(decodedMessage.currentTs)).toISOString()
      : new Date().toISOString(),
    feeds: normalizedFeeds,
  };
};

export { normalizeWebSocketFeed };  