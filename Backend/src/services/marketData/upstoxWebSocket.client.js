import WebSocket from "ws";
import { getUpstoxWebSocketUrl } from "./upstoxWebSocket.service.js";
import { loadUpstoxProto } from "./upstoxProtobuf.js";
import { normalizeWebSocketFeed } from "./webSocketNormalizer.js";

const connectUpstoxMarketFeed = async (onFeed) => {
  const websocketUrl = await getUpstoxWebSocketUrl();
  const FeedResponse = await loadUpstoxProto();

  return new Promise((resolve, reject) => {
    let settled = false;

    const socket = new WebSocket(websocketUrl, {
      followRedirects: true,
    });

    const cleanupFailedConnection = () => {
      socket.removeAllListeners("open");
      socket.removeAllListeners("message");
      socket.removeAllListeners("error");
      socket.removeAllListeners("close");
    };

    socket.on("open", () => {
      console.log("Upstox WebSocket connected successfully");

      const subscriptionRequest = {
        guid: `tradexen-${Date.now()}`,
        method: "sub",
        data: {
          mode: "ltpc",
          instrumentKeys: [
            "NSE_EQ|INE002A01018", // RELIANCE
            "NSE_EQ|INE467B01029", // TCS
            "NSE_EQ|INE009A01021", // INFY
            "NSE_EQ|INE040A01034", // HDFCBANK
            "NSE_EQ|INE090A01021", // ICICIBANK
          ],
        },
      };

      socket.send(Buffer.from(JSON.stringify(subscriptionRequest)));

      console.log("Subscribed to TradeXen terminal instruments");

      if (!settled) {
        settled = true;
        resolve(socket);
      }
    });

    socket.on("message", (data) => {
      console.log("Upstox WebSocket message received:", data.length, "bytes");

      try {
        const decodedMessage = FeedResponse.decode(data);

        console.log("Decoded Upstox feed received");

        const normalizedData = normalizeWebSocketFeed(decodedMessage);

        if (!normalizedData) {
          return;
        }

        if (!normalizedData.feeds?.length) {
          return;
        }

        console.log(
          "Normalized market data:",
          JSON.stringify(normalizedData, null, 2),
        );

        if (typeof onFeed === "function") {
          onFeed(normalizedData);
        }
      } catch (error) {
        console.error("Protobuf decode/normalization error:", error.message);
      }
    });

    socket.on("error", (error) => {
      console.error("Upstox WebSocket error:", error.message);

      if (!settled) {
        settled = true;

        cleanupFailedConnection();

        reject(error);
      }
    });

    socket.on("close", (code, reason) => {
      console.log(
        `Upstox WebSocket closed. Code: ${code}, Reason: ${reason.toString()}`,
      );

      if (!settled) {
        settled = true;

        cleanupFailedConnection();

        reject(
          new Error(
            `Upstox WebSocket closed before connection was established. Code: ${code}`,
          ),
        );
      }
    });
  });
};

export { connectUpstoxMarketFeed };
