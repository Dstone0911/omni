
import React, { useState } from 'react';
import { NETWORKS } from '../constants';
import { Network, ChainType } from '../types';
import { X, Globe, Zap, TestTube, Search } from 'lucide-react';

interface NetworkSelectorProps {
  selectedNetwork: Network;
  onSelect: (network: Network) => void;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({ 
  selectedNetwork, 
  onSelect, 
  isOpen, 
  onClose,
  title
}) => {
  const [filter, setFilter] = useState<ChainType | 'ALL'>('ALL');

  if (!isOpen) return null;

  const filteredNetworks = NETWORKS.filter(n => filter === 'ALL' || n.type === filter);

  const getIcon = (type: ChainType) => {
    switch (type) {
      case ChainType.MAINNET: return <Globe size={18} className="text-blue-400" />;
      case ChainType.VNET: return <Zap size={18} className="text-purple-400" />;
      case ChainType.TESTNET: return <TestTube size={18} className="text-yellow-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md glass rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold tracking-tight">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
            {(['ALL', ChainType.MAINNET, ChainType.VNET, ChainType.TESTNET] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === type ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="p-2 max-h-[400px] overflow-y-auto">
          {filteredNetworks.map((net) => (
            <button
              key={net.id}
              onClick={() => {
                onSelect(net);
                onClose();
              }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group border ${
                selectedNetwork.id === net.id ? 'bg-white/10 border-blue-500/30' : 'border-transparent'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all">
                  {getIcon(net.type)}
                </div>
                <div className="text-left">
                  <div className="font-bold text-base">{net.name}</div>
                  <div className="text-[10px] text-gray-500 font-mono">Chain ID: {net.chainId}</div>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full shadow-[0_0_8px]`} style={{ backgroundColor: net.color, boxShadow: `0 0 8px ${net.color}` }} />
            </button>
          ))}
        </div>

        <div className="p-6 bg-blue-500/5 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-500 font-medium italic">
            Select a Tenderly vNet for zero-latency Mainnet mirroring and abstraction testing.
          </p>
        </div>
      </div>
    </div>
  );
};
