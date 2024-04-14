# XMTP Faucet Bot

![](https://github.com/xmtp/awesome-xmtp/assets/1447073/9bb4f8c2-321e-4b6d-b52e-2105d69c4d47)

This is a PoC for an XMTP bot sending Faucet testnet funds through XMTP. Powered by [Learnweb3](https://learnweb3.io/faucets/)

## How does it work

The XMTP Faucet Bot streamlines the distribution of testnet tokens via XMTP messages, leveraging the LearnWeb3 API for operations:

1. **Initialization**: Initiates connections to XMTP and Redis, and sets up an in-memory cache for tracking interactions.

2. **Message Handling**: Listens for and evaluates incoming XMTP messages.

3. **Opt-Out**: Users sending "stop" are flagged in the cache to cease token distributions.

4. **Network Checks**: Validates supported networks and their balances through Redis, refreshing data from the LearnWeb3 API as necessary.

5. **Rate limit**: Every testnet is liited to once per day per address.

## Getting started

> ⚠️ Ensure you're using `Yarn 4` for dependency management. Check with `yarn --version`.

To install dependencies:

```bash
yarn
```

To run:

```bash
yarn build
yarn start
```

To run with hot-reload:

```bash
yarn build:watch
yarn start:watch
```

### Environment

```bash
cp .env.example .env
```

then populate the environment variables accordingly

```bash
LEARN_WEB3_API_KEY= # Your LearnWeb3 API key
KEY= # The private key for the bot
XMTP_ENV= # XMTP environment (production or development)
REDIS_CONNECTION_STRING= # Redis connection string for caching and other operations
FRAME_BASE_URL= # Base URL for the frame application
PUBLIC_BOT_ADDRESS= # Public address of the bot
HEARTBEAT_BOT_KEY= # Private key for the heartbeat functionality of the bot
DEBUG= # Enable or disable debug mode (true or false)
```
