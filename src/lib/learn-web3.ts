const EVM_TOKENS = ["ETH", "MATIC", "USDC"];

export interface Network {
  networkId: string;
  networkName: string;
  networkLogo: string;
  tokenName: string;
  dripAmount: number;
  address: string;
  isERC20: boolean;
  erc20Address?: string;
  erc20Decimals?: number;
  isActive: boolean;
  balance: string;
}

export interface DripTokensResponse {
  ok: boolean;
  error?: string;
  value?: string;
}

export class LearnWeb3Client {
  public BASE_URL = "https://learnweb3.io/api/faucet";
  private apiKey = process.env.LEARN_WEB3_API_KEY;
  constructor() {
    if (!process.env.LEARN_WEB3_API_KEY) {
      throw new Error("Please set the LEARN_WEB3_API_KEY environment variable");
    }
    this.apiKey = process.env.LEARN_WEB3_API_KEY;
  }

  async getNetworks(onlyEvm = true): Promise<Network[]> {
    const response = await fetch(`${this.BASE_URL}/networks`);
    const data: Network[] = await response.json();
    if (onlyEvm) {
      return data.filter((network) =>
        EVM_TOKENS.some((t) =>
          network.tokenName.toLowerCase().includes(t.toLowerCase())
        )
      );
    }
    return response.json();
  }

  async dripTokens(
    networkId: string,
    recipientAddress: string
  ): Promise<DripTokensResponse> {
    const response = await fetch(`${this.BASE_URL}/drip`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ networkId, recipientAddress }),
    });
    return await response.json();
  }
}
