
import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (provider: 'metamask' | 'walletconnect' | 'coinbase') => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onConnect }) => {
  if (!isOpen) return null;

  const providers = [
    { id: 'metamask' as const, name: 'MetaMask', icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg' },
    { id: 'walletconnect' as const, name: 'WalletConnect', icon: 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg' },
    { id: 'coinbase' as const, name: 'Coinbase Wallet', icon: 'https://avatars.githubusercontent.com/u/18060234?s=280&v=4' }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm glass rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold">Connect Wallet</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-3">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => onConnect(p.id)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-blue-500/30 group"
            >
              <div className="flex items-center gap-4">
                <img src={p.icon} alt={p.name} className="w-8 h-8 rounded-lg" />
                <span className="font-bold text-base">{p.name}</span>
              </div>
              <div className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                POPULAR
              </div>
            </button>
          ))}
        </div>

        <div className="p-6 text-center border-t border-white/10">
          <p className="text-xs text-gray-500 mb-4 px-4">
            By connecting a wallet, you agree to OmniChain X's Terms of Service and Privacy Policy.
          </p>
          <a href="https://walletconnect.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs text-blue-400 font-bold hover:underline">
            What is a Wallet? <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};
