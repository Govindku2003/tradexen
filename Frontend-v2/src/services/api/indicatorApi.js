// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL ||
//   "http://localhost:5000/api";

// const getMarketIndicators = async ({
//   instrumentKey,
//   unit = "minutes",
//   interval = "5",
//   from,
//   to,
//   smaPeriod = 20,
//   emaPeriod = 20,
//   rsiPeriod = 14,
//   macdFastPeriod = 12,
//   macdSlowPeriod = 26,
//   macdSignalPeriod = 9,
// }) => {
//   const params = new URLSearchParams({
//     instrumentKey,
//     unit,
//     interval,
//     smaPeriod: String(smaPeriod),
//     emaPeriod: String(emaPeriod),
//     rsiPeriod: String(rsiPeriod),
//     macdFastPeriod: String(macdFastPeriod),
//     macdSlowPeriod: String(macdSlowPeriod),
//     macdSignalPeriod: String(macdSignalPeriod),
//   });

//   if (from) {
//     params.set("from", from);
//   }

//   if (to) {
//     params.set("to", to);
//   }

//   const response = await fetch(
//     `${API_BASE_URL}/market-data/indicators?${params.toString()}`
//   );

//   const result = await response.json();

//   if (!response.ok || !result.success) {
//     throw new Error(
//       result.message || "Unable to fetch market indicators"
//     );
//   }

//   return result.data;
// };

// export {
//   getMarketIndicators,
// };

import apiRequest from "./apiClient";

const getMarketIndicators = async ({
  instrumentKey,
  unit = "minutes",
  interval = "5",
  from,
  to,
  smaPeriod = 20,
  emaPeriod = 20,
  rsiPeriod = 14,
  macdFastPeriod = 12,
  macdSlowPeriod = 26,
  macdSignalPeriod = 9,
}) => {
  if (!instrumentKey) {
    throw new Error("Instrument key is required");
  }

  const params = new URLSearchParams({
    instrumentKey,
    unit,
    interval,
    smaPeriod: String(smaPeriod),
    emaPeriod: String(emaPeriod),
    rsiPeriod: String(rsiPeriod),
    macdFastPeriod: String(macdFastPeriod),
    macdSlowPeriod: String(macdSlowPeriod),
    macdSignalPeriod: String(macdSignalPeriod),
  });

  if (from) {
    params.set("from", from);
  }

  if (to) {
    params.set("to", to);
  }

  return apiRequest(`/market-data/indicators?${params.toString()}`);
};

export { getMarketIndicators };
