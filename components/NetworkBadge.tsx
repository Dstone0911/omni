
import React from 'react';
import { ChainType } from '../types';

interface NetworkBadgeProps {
  type: ChainType;
  name: string;
}

export const NetworkBadge: React.FC<NetworkBadgeProps> = ({ type, name }) => {
  const getColors = () => {
    switch (type) {
      case ChainType.MAINNET: return 'bg-blue-900/40 text-blue-400 border-blue-500/50';
      case ChainType.VNET: return 'bg-purple-900/40 text-purple-400 border-purple-500/50';
      case ChainType.TESTNET: return 'bg-yellow-900/40 text-yellow-400 border-yellow-500/50';
      default: return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  return (
    <div className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getColors()}`}>
      {name}
    </div>
  );
};
