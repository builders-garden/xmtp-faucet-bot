# XMTP Trending Mints Bot

This is a PoC for an XMTP bot sending Base trending mints alert to subscribed users

## How does it work

### Subscribing

1. A user can message the trendingmints.eth bot from any XMTP client.
2. The bot will respond with a pre-defined message (e.g. "Welcome to the trendingmints bot where you get instant alerts when mints start trending.")
3. The bot will then ask for the users preferences on how frequent they would like to receive mint alerts with a message including different options to choose.
4. Once the users replies with their choice, they are subscribed to trendingmints.eth bot (their preference is stored on a Redis DB)
5. The bot will send back to the user a message to confirm the successfull subscription.

### Distribution

- Every hour, every two hours and every day at 6pm UTC, a cronjob is running to check the latest trending mints and notify the users accordingly to theri preference
- The bot send the current top 2 trending mints, ensuring they have not been sent already in a previous message
- For each trending mint we include a link to a Frame supporting XMTP that shows the NFT image, the name of the collection and the number of total mints. In addition, the frame will have a button that redirects to Zora for minting purposes.

### Unsubscribing

If the user sends "stop" or "unsubscribe", they are removed from the list and will no more receive any mint.

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

then populate the environment variables accordingly
