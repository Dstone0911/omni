
import React, { useState, useMemo, useEffect } from 'react';
import { TOKENS } from '../constants';
import { Token, Network } from '../types';
import { Search, Info, X, Loader2, PlusCircle } from 'lucide-react';

interface TokenSelectorProps {
  selectedToken: Token;
  onSelect: (token: Token) => void;
  isOpen: boolean;
  onClose: () => void;
  targetNetwork: Network;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({ 
  selectedToken, 
  onSelect, 
  isOpen, 
  onClose,
  targetNetwork 
}) => {
  const [search, setSearch] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [foundToken, setFoundToken] = useState<Token | null>(null);

  const isAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

  useEffect(() => {
    const fetchMetadata = async () => {
      const query = search.trim();
      if (!isAddress(query)) {
        setFoundToken(null);
        return;
      }

      // Check if already in local list
      const localMatch = TOKENS.find(t => t.address.toLowerCase() === query.toLowerCase());
      if (localMatch) {
        setFoundToken(null);
        return;
      }

      setIsFetching(true);
      try {
        // Attempting to fetch from CoinGecko API for Ethereum tokens
        // Since Tenderly vNets mirror mainnet addresses, we can use mainnet metadata
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${query}`);
        if (!response.ok) throw new Error('Token not found on public registries');
        
        const data = await response.json();
        const newToken: Token = {
          symbol: data.symbol.toUpperCase(),
          name: data.name,
          address: query,
          decimals: data.detail_platforms?.ethereum?.decimal_place || 18,
          logoUrl: data.image?.small || 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
          price: data.market_data?.current_price?.usd || 0,
          supportedNetworks: [targetNetwork.id] // Assume compatibility for vNet/Mainnet mirror
        };
        setFoundToken(newToken);
      } catch (error) {
        console.error('Metadata fetch failed:', error);
        setFoundToken(null);
      } finally {
        setIsFetching(false);
      }
    };

    const timer = setTimeout(fetchMetadata, 500);
    return () => clearTimeout(timer);
  }, [search, targetNetwork.id]);

  const filteredTokens = useMemo(() => {
    return TOKENS.filter(token => {
      const matchesSearch = 
        token.symbol.toLowerCase().includes(search.toLowerCase()) || 
        token.name.toLowerCase().includes(search.toLowerCase()) ||
        token.address.toLowerCase() === search.toLowerCase();
      
      const isSupported = !token.supportedNetworks || token.supportedNetworks.includes(targetNetwork.id);
      
      return matchesSearch && isSupported;
    });
  }, [search, targetNetwork]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md glass rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold tracking-tight">Select a token</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
              {isFetching ? <Loader2 size={18} className="animate-spin text-blue-400" /> : <Search size={18} />}
            </div>
            <input 
              autoFocus
              type="text"
              placeholder="Search name or paste address"
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {['ETH', 'USDC', 'WBTC'].map(sym => (
              <button 
                key={sym}
                onClick={() => setSearch(sym)}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/5"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
          {foundToken && (
            <div className="mb-4">
              <div className="px-4 py-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                <PlusCircle size={10} /> Found via Address
              </div>
              <button
                onClick={() => {
                  onSelect(foundToken);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={foundToken.logoUrl} alt={foundToken.symbol} className="w-10 h-10 rounded-full shadow-lg" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#111827] flex items-center justify-center overflow-hidden" style={{ backgroundColor: targetNetwork.color }}>
                       <div className="w-full h-full opacity-50 bg-white" />
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-base group-hover:text-blue-400 transition-colors">{foundToken.symbol}</div>
                    <div className="text-xs text-gray-500">{foundToken.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${foundToken.price.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-500 font-mono italic uppercase">Imported</div>
                </div>
              </button>
            </div>
          )}

          <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Tokens on {targetNetwork.name}
          </div>
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token) => (
              <button
                key={token.symbol}
                onClick={() => {
                  onSelect(token);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 transition-all group ${selectedToken.symbol === token.symbol ? 'bg-white/10 border-blue-500/20' : 'border-transparent'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={token.logoUrl} alt={token.symbol} className="w-10 h-10 rounded-full shadow-lg" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#111827] flex items-center justify-center overflow-hidden" style={{ backgroundColor: targetNetwork.color }}>
                       <div className="w-full h-full opacity-50 bg-white" />
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-base group-hover:text-blue-400 transition-colors">{token.symbol}</div>
                    <div className="text-xs text-gray-500">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${token.price.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    {token.address.slice(0, 6)}...{token.address.slice(-4)}
                  </div>
                </div>
              </button>
            ))
          ) : !foundToken && (
            <div className="p-10 text-center text-gray-500 text-sm">
              {isFetching ? 'Scanning blockchain registries...' : 'No compatible tokens found.'}
            </div>
          )}
        </div>

        <div className="p-4 bg-blue-500/5 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] text-blue-400 font-medium leading-tight">
            <Info size={12} />
            <span>Tokens on synced vNets share identical contract addresses with Mainnet for seamless abstraction.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
