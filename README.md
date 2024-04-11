# XMTP Faucet Bot

This is a PoC for an XMTP bot that allows people to request testnet tokens via chat.

## How does it work

The users send a message to the bot, that will reply with a welcoming message and a list of supported testnets faucets and how much balance is left in each faucet.

When the user selects the desired network, the bot checks:

- If the selected testnet is correct or not;
- If the user has already reached the maximum claim count for the window (default 1 day), the bot will reply with a message saying that the user has reached the maximum claim count.

Once those checks are cleared, the bot will drip the tokens to the user and present a frame with the transaction details, and a link to check the transaction.

## Getting started

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

then populate the environment variables accordingly.
