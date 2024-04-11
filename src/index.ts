import "dotenv/config";
import { privateKeyToAccount } from "viem/accounts";
import HandlerContext from "./handler-context";
import run from "./runner.js";
import { getRedisClient } from "./lib/redis.js";
import { LearnWeb3Client, Network } from "./lib/learn-web3.js";
import { FIVE_MINUTES, FRAME_BASE_URL } from "./lib/constants.js";

const inMemoryCache = new Map<string, number>();
const testnetMemoryCache = new Map<string, string>();

const resetMemoryCache = (address: string) => {
  inMemoryCache.set(address, 0);
  testnetMemoryCache.delete(address);
};

run(async (context: HandlerContext) => {
  const { message } = context;
  const wallet = privateKeyToAccount(process.env.KEY as `0x${string}`);

  const { content, senderAddress } = message;

  if (senderAddress?.toLowerCase() === wallet.address?.toLowerCase()) {
    // safely ignore this message
    return;
  }

  if (content === "reset") {
    resetMemoryCache(senderAddress);
  }

  const redisClient = await getRedisClient();

  const cachedSupportedNetworksData = await redisClient.get(
    "supported-networks"
  );
  let supportedNetworks: {
    id: string;
    balance: string;
    name: string;
    tokenName: string;
  }[];
  const learnWeb3Client = new LearnWeb3Client();
  if (
    !cachedSupportedNetworksData ||
    parseInt(JSON.parse(cachedSupportedNetworksData!)?.lastSyncedAt) >
      Date.now() + FIVE_MINUTES
  ) {
    const updatedSupportedNetworksData = await learnWeb3Client.getNetworks();
    await redisClient.set(
      "supported-networks",
      JSON.stringify({
        lastSyncedAt: Date.now(),
        supportedNetworks: updatedSupportedNetworksData,
      })
    );
    supportedNetworks = updatedSupportedNetworksData.map((n: Network) => ({
      id: n.networkId,
      balance: n.balance,
      name: n.networkName,
      tokenName: n.tokenName,
    }));
  } else {
    supportedNetworks = JSON.parse(
      cachedSupportedNetworksData!
    ).supportedNetworks?.map((n: Network) => ({
      id: n.networkId,
      balance: n.balance,
      name: n.networkName,
      tokenName: n.tokenName,
    }));
  }

  // get the current step we're in
  const step = inMemoryCache.get(senderAddress);

  if (!step) {
    const networksList = `${supportedNetworks
      .map(
        (n) => `- ${n.name} (${n.id}) | Balance: ${n.balance} ${n.tokenName}`
      )
      .join("\n")}`;
    // send the first message
    await context.reply(
      "Hey! I can assist you in obtaining testnet tokens. Please tell me the testnet you're interested in."
    );

    // send the second message
    await context.reply(networksList);
    await context.reply("Please reply with the testnet ID (e.g. ropsten).");

    inMemoryCache.set(senderAddress, 1);
  } else if (step === 1) {
    const inputNetworkString = content.trim().toLowerCase().replace(" ", "_");
    const selectedNetwork = supportedNetworks.find(
      (n) => n.id === inputNetworkString
    );
    if (!selectedNetwork) {
      await context.reply(
        `❌ I'm sorry, but I don't support ${content} at the moment. Can I assist you with a different testnet?`
      );
      return;
    }

    const lastClaims = await redisClient.get(`last-claims-${senderAddress}`);

    if (lastClaims) {
      const [lastClaimedAt, claimCount] = lastClaims?.split("-");
      if (
        Number(lastClaimedAt) <
          Date.now() - Number(process.env.CLAIM_WINDOW as string) &&
        Number(claimCount) >= Number(process.env.MAX_CLAIM_COUNT as string)
      ) {
        const nextClaimAt =
          Number(lastClaimedAt) + Number(process.env.CLAIM_WINDOW as string);
        const timeToNextClaim = nextClaimAt - Date.now();
        const timeToNextClaimHours = Math.floor(
          timeToNextClaim / 1000 / 60 / 60
        );
        const timeToNextClaimMinutes =
          Math.floor(timeToNextClaim / 1000 / 60) % 60;

        await context.reply(
          `Sorry, you've reached the maximum number of claims for today. Try again in ${timeToNextClaimHours} hours and ${timeToNextClaimMinutes} minutes!`
        );
        resetMemoryCache(senderAddress);
        return;
      }
    }

    await context.reply(
      `Your ${selectedNetwork.name} ${selectedNetwork.tokenName} tokens are being processed. Please wait a moment for the transaction to process.`
    );
    const result = await learnWeb3Client.dripTokens(
      inputNetworkString,
      senderAddress
    );
    if (!result.ok) {
      await context.reply(
        `❌ Sorry, there was an error processing your request:\n\n"${result.error!}"`
      );
      resetMemoryCache(senderAddress);
      return;
    } else {
      if (lastClaims) {
        // increment the claim count
        const [lastClaimedAt, claimCount] = lastClaims.split("-");
        await redisClient.set(
          `last-claims-${senderAddress}`,
          `${lastClaimedAt}-${Number(claimCount) + 1}`
        );
      } else {
        await redisClient.set(
          `last-claims-${senderAddress}`,
          `${Date.now()}-1`
        );
      }
    }
    await context.reply("Here's your transaction receipt:");
    await context.reply(
      `${FRAME_BASE_URL}?networkId=${content}&txLink=${result.value}`
    );
    resetMemoryCache(senderAddress);
  }
});
