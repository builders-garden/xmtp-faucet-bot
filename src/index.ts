import "dotenv/config";
import { privateKeyToAccount } from "viem/accounts";
import HandlerContext from "./handler-context";
import run from "./runner.js";
import { getRedisClient } from "./lib/redis.js";
import { LearnWeb3Client } from "./lib/learn-web3.js";
import { CLAIM_EVERY, SUPPORTED_NETWORKS } from "./lib/constants.js";

const inMemoryCache = new Map<string, number>();

run(async (context: HandlerContext) => {
  const { message } = context;
  const wallet = privateKeyToAccount(process.env.KEY as `0x${string}`);

  const { content, senderAddress } = message;

  if (senderAddress?.toLowerCase() === wallet.address?.toLowerCase()) {
    // safely ignore this message
    return;
  }

  const redisClient = await getRedisClient();

  // get the current step we're in
  const step = inMemoryCache.get(senderAddress);

  // check if the message is an unsubscribe message
  if (
    content?.toLowerCase() === "stop" ||
    content?.toLowerCase() === "unsubscribe"
  ) {
    // unsubscribe the user
    await redisClient.del(senderAddress);
  }

  if (!step) {
    // send the first message
    await context.reply("Hey! I can assist you in obtaining testnet tokens.");

    // send the second message
    await context.reply(
      `Here the options you can choose from (make sure to copy and paste the name exactly!):\n${SUPPORTED_NETWORKS.map(
        (n) => `- ${n}`
      ).join("\n")}`
    );

    inMemoryCache.set(senderAddress, 1);
  } else if (step === 1) {
    if (!SUPPORTED_NETWORKS.includes(content)) {
      await context.reply(
        `‼️ I'm sorry, but I don't support ${content} at the moment. Can I assist you with a different testnet?`
      );
      return;
    }

    /* UNCOMMENT TO ADD A CUSTOM COOLDOWN TIME PER USER, LEARN WEB3 HAS 24HRS DEFAULT
    const lastClaimedAt = await redisClient.get(
      `last-claimed-at-${senderAddress}`
    );
    // check if the user has claimed in the last X hours
    if (Number(lastClaimedAt) > Date.now() - CLAIM_EVERY) {
      await context.reply(
        "Sorry, your only allowed once every 24 hours. Try again later!"
      );
      return;
    }

    // store the user's preference
    await redisClient.set(`last-claimed-at-${senderAddress}`, Date.now());*/

    await context.reply(
      "Your testnet tokens are being processed. Please wait a moment for the transaction to process."
    );
    const learnWeb3Client = new LearnWeb3Client();
    const result = await learnWeb3Client.dripTokens(content, wallet.address);
    if (!result.ok) {
      await context.reply(
        `‼️ Sorry, there was an error processing your request:\n\n"${result.error!}"`
      );
      return;
    }
    await context.reply("Here's your transaction receipt:");
    await context.reply(result.value);
  }
});
