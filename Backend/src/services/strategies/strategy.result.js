const createStrategyResult = ({
  strategy,
  signal,
  reason = "",
  indicators = {},
}) => {
  return {
    strategy,
    signal,
    reason,
    indicators,
    generatedAt: new Date().toISOString(),
  };
};

export { createStrategyResult };