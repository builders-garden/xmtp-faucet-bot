# Faucet Bot

> 💬 **Try it:** Message `faucetbot.eth`

Go to [BotKit](https://github.com/xmtp/botkit) to learn more

This bot uses [Mint Frame](https://github.com/fabriguespe/mint-frame/)

## Development

To kickstart the tutorial, you'll need to clone the repository containing the bot code. Follow these steps:

```bash
git clone https://github.com/fabriguespe/faucet-bot.git
cd faucet-bot
# copy env variables template
cp .env.example .env
```

**Set the variables**

```bash
KEY= # The private key for the bot
XMTP_ENV= # XMTP environment (production or dev)
LEARN_WEB3_API_KEY= # Your LearnWeb3 API key
REDIS_CONNECTION_STRING= # Redis connection string for caching
FRAME_BASE_URL= # Base URL for the frame application
MIX_PANEL= # 034d959e29055215a083a6b7d8497b37
```

> ⚠️ Bot kit is not compatible with `bun` yet. Use `npm` or `yarn`

```bash
# install dependencies
yarn install

# running the bot
yarn build
yarn start

# to run with hot-reload
yarn build:watch
yarn start:watch

# run the echo example
yarn build:watch
yarn start:echo
```

---

Powered by <a href="https://learnweb3.io/faucets">Learnweb3</a>
