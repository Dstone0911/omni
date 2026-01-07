
import { Network, ChainType, Token } from './types';

export const NETWORKS: Network[] = [
  {
    id: 'eth-main',
    name: 'Ethereum Mainnet',
    type: ChainType.MAINNET,
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
    explorerUrl: 'https://etherscan.io',
    chainId: 1,
    color: '#627EEA'
  },
  {
    id: 'tenderly-vnet-1',
    name: 'Tenderly vNet Delta',
    type: ChainType.VNET,
    rpcUrl: 'https://virtual.mainnet.tenderly.co/unique-id',
    explorerUrl: 'https://dashboard.tenderly.co/vnet',
    chainId: 1337,
    color: '#ff007a'
  },
  {
    id: 'sepolia-test',
    name: 'Sepolia Testnet',
    type: ChainType.TESTNET,
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/demo',
    explorerUrl: 'https://sepolia.etherscan.io',
    chainId: 11155111,
    color: '#CFADFF'
  }
];

export const TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    price: 2450.50,
    supportedNetworks: ['eth-main', 'tenderly-vnet-1', 'sepolia-test']
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    decimals: 6,
    logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
    price: 1.00,
    supportedNetworks: ['eth-main', 'tenderly-vnet-1', 'sepolia-test']
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    decimals: 8,
    logoUrl: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
    price: 43200.00,
    supportedNetworks: ['eth-main', 'tenderly-vnet-1']
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    address: '0x514910771af9ca656af840dff83e8264ecf986ca',
    decimals: 18,
    logoUrl: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
    price: 14.20,
    supportedNetworks: ['eth-main', 'tenderly-vnet-1', 'sepolia-test']
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    decimals: 18,
    logoUrl: 'https://assets.coingecko.com/coins/images/9956/small/Badge_Self-Sovereign_Data_DAI.png',
    price: 1.00,
    supportedNetworks: ['eth-main', 'tenderly-vnet-1']
  }
];
