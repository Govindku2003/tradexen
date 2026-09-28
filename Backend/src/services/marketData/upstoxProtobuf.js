import protobuf from "protobufjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const protoPath = path.join(
  __dirname,
  "proto",
  "MarketDataFeed.proto"
);

const loadUpstoxProto = async () => {
  const root = await protobuf.load(protoPath);

  const FeedResponse = root.lookupType(
    "com.upstox.marketdatafeederv3udapi.rpc.proto.FeedResponse"
  );

  return FeedResponse;
};

export { loadUpstoxProto };