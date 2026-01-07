
export enum ChainType {
  MAINNET = 'MAINNET',
  VNET = 'VNET',
  TESTNET = 'TESTNET'
}

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl: string;
  price: number;
  supportedNetworks?: string[]; // IDs of networks where this token exists
}

export interface Network {
  id: string;
  name: string;
  type: ChainType;
  rpcUrl: string;
  explorerUrl: string;
  chainId: number;
  color: string;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  provider: 'metamask' | 'walletconnect' | 'coinbase' | null;
  balance: string;
}

export interface BridgeStatus {
  step: 'PREPARING' | 'SIGNING' | 'VNET_LOCK' | 'VALIDATING' | 'MAINNET_MINT' | 'COMPLETED';
  progress: number;
  message: string;
}
