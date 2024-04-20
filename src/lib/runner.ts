import createClient from "./client.js";
import HandlerContext from "./handler-context.js";
import { scheduleHeartbeat } from "./heartbeat.js";

type Handler = (message: HandlerContext) => Promise<void>;

export default async function run(handler: Handler) {
  const client = await createClient();
  scheduleHeartbeat();
  console.log(`Listening on ${client.address}`);

  for await (const message of await client.conversations.streamAllMessages(
    () => {
      console.log("Connection lost");
    }
  )) {
    try {
      if (message.senderAddress == client.address) continue;

      const context = new HandlerContext(message);
      await handler(context);
    } catch (e) {
      console.log(`error`, e);
    }
  }
}
