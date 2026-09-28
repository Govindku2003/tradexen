import WebSocket from "ws";
import { getUpstoxWebSocketUrl } from "./upstoxWebSocket.service.js";
import { loadUpstoxProto } from "./upstoxProtobuf.js";
import { normalizeWebSocketFeed } from "./webSocketNormalizer.js";

const connectUpstoxMarketFeed = async () => {
  const websocketUrl = await getUpstoxWebSocketUrl();
  const FeedResponse = await loadUpstoxProto();

  return new Promise((resolve, reject) => {
    const socket = new WebSocket(websocketUrl, {
      followRedirects: true,
    });

    socket.on("open", () => {
      console.log("Upstox WebSocket connected successfully");

      const subscriptionRequest = {
        guid: `tradexen-${Date.now()}`,
        method: "sub",
        data: {
          mode: "ltpc",
          instrumentKeys: ["NSE_INDEX|Nifty 50"],
        },
      };

      socket.send(
        Buffer.from(JSON.stringify(subscriptionRequest))
      );

      console.log(
        "Subscribed to: NSE_INDEX|Nifty 50"
      );

      resolve(socket);
    });

    socket.on("message", (data) => {
      try {
        const decodedMessage = FeedResponse.decode(data);

        const normalizedData =
          normalizeWebSocketFeed(decodedMessage);

        if (normalizedData?.feeds?.length) {
          console.log(
            "Normalized market data:",
            JSON.stringify(normalizedData, null, 2)
          );
        }
      } catch (error) {
        console.error(
          "Protobuf decode/normalization error:",
          error.message
        );
      }
    });

    socket.on("error", (error) => {
      console.error(
        "Upstox WebSocket error:",
        error.message
      );

      reject(error);
    });

    socket.on("close", (code, reason) => {
      console.log(
        `Upstox WebSocket closed. Code: ${code}, Reason: ${reason.toString()}`
      );
    });
  });
};

export { connectUpstoxMarketFeed };