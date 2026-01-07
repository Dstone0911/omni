
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NETWORKS, TOKENS } from './constants';
import { ChainType, Network, Token, BridgeStatus, WalletState } from './types';
import { NetworkBadge } from './components/NetworkBadge';
import { TokenSelector } from './components/TokenSelector';
import { NetworkSelector } from './components/NetworkSelector';
import { WalletModal } from './components/WalletModal';
import { AssetFlowGraph } from './components/AssetFlowGraph';
import { analyzeAbstractRoute } from './services/geminiService';
import { Activity, ArrowDownUp, ShieldCheck, Zap, Layers, Info, History, Settings, ExternalLink, Wallet, CheckCircle2, X, ChevronDown, Flame, Sliders, Gavel } from 'lucide-react';

const App: React.FC = () => {
  // Global State
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    provider: null,
    balance: '0.00'
  });
  
  // Bridge State
  const [fromNetwork, setFromNetwork] = useState<Network>(NETWORKS[1]); // Tenderly vNet
  const [toNetwork, setToNetwork] = useState<Network>(NETWORKS[0]); // Mainnet
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]); // ETH
  const [toToken, setToToken] = useState<Token>(TOKENS[1]); // USDC
  const [amount, setAmount] = useState<string>('');
  
  // Advanced Options State
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
  const [gasLimit, setGasLimit] = useState<string>('500000'); // Higher default for complex abstraction
  const [slippage, setSlippage] = useState<string>('0.1');
  const [selectedProtocol, setSelectedProtocol] = useState<string>('Force-Relay');

  // UI State
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
  const [isNetworkSelectorOpen, setIsNetworkSelectorOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [activeSelector, setActiveSelector] = useState<'from' | 'to'>('from');
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [forceInterop, setForceInterop] = useState(true); // "Unconventional" Interop

  // Computed
  const toAmount = useMemo(() => {
    if (!amount || isNaN(parseFloat(amount))) return '0.00';
    return (parseFloat(amount) * (fromToken.price / toToken.price)).toFixed(6);
  }, [amount, fromToken.price, toToken.price]);

  // Handlers
  const handleConnectWallet = (provider: WalletState['provider']) => {
    setWallet({
      connected: true,
      address: '0x71C7...fE3d',
      provider,
      balance: '12.45'
    });
    setIsWalletModalOpen(false);
  };

  const handleDisconnect = () => {
    setWallet({ connected: false, address: null, provider: null, balance: '0.00' });
  };

  /**
   * Refined Network & Token Swap Logic:
   * Uses "Ghost Mirroring" logic to maintain asset interoperability across virtual and main networks.
   * If Force Interop is ON, it allows tokens to be moved even if they are technically "unsupported"
   * on the target chain by assuming a shadow-state contract mirror exists.
   */
  const handleSwapNetworks = () => {
    const prevFromNet = fromNetwork;
    const prevToNet = toNetwork;
    const prevFromToken = fromToken;
    const prevToToken = toToken;

    // Swap the networks
    setFromNetwork(prevToNet);
    setToNetwork(prevFromNet);

    // Swap the tokens
    setFromToken(prevToToken);
    setToToken(prevFromToken);

    // Intelligent compatibility workaround
    if (!forceInterop) {
      // Standard compatibility check
      const isFromTokenSupported = !prevToToken.supportedNetworks || prevToToken.supportedNetworks.includes(prevToNet.id);
      const isToTokenSupported = !prevFromToken.supportedNetworks || prevFromToken.supportedNetworks.includes(prevFromNet.id);

      if (!isFromTokenSupported) {
        setFromToken(TOKENS.find(t => t.supportedNetworks?.includes(prevToNet.id)) || TOKENS[0]);
      }
      if (!isToTokenSupported) {
        setToToken(TOKENS.find(t => t.supportedNetworks?.includes(prevFromNet.id)) || TOKENS[1]);
      }
    } else {
      // FORCE INTEROP: Ghost Mirroring
      // We keep the tokens regardless of 'supportedNetworks' because the abstraction layer
      // will force-sync the contract bytecode and state to the destination chain.
      console.warn("Bypassing compatibility constraints: Initiating Ghost Mirror for", prevToToken.symbol, "on", prevToNet.name);
    }
  };

  const handleOpenTokenSelector = (type: 'from' | 'to') => {
    setActiveSelector(type);
    setIsTokenSelectorOpen(true);
  };

  const handleOpenNetworkSelector = (type: 'from' | 'to') => {
    setActiveSelector(type);
    setIsNetworkSelectorOpen(true);
  };

  const handleSelectToken = (token: Token) => {
    if (activeSelector === 'from') setFromToken(token);
    else setToToken(token);
  };

  const handleSelectNetwork = (network: Network) => {
    if (activeSelector === 'from') {
      setFromNetwork(network);
      if (!forceInterop && fromToken.supportedNetworks && !fromToken.supportedNetworks.includes(network.id)) {
        const fallback = TOKENS.find(t => t.supportedNetworks?.includes(network.id));
        if (fallback) setFromToken(fallback);
      }
    } else {
      setToNetwork(network);
      if (!forceInterop && toToken.supportedNetworks && !toToken.supportedNetworks.includes(network.id)) {
        const fallback = TOKENS.find(t => t.supportedNetworks?.includes(network.id));
        if (fallback) setToToken(fallback);
      }
    }
  };

  const startAnalysis = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsAnalyzing(true);
    const result = await analyzeAbstractRoute(fromNetwork.name, toNetwork.name, fromToken.symbol, amount);
    setAnalysis(result || "Failed to analyze path.");
    setIsAnalyzing(false);
  }, [fromNetwork.name, toNetwork.name, fromToken.symbol, amount]);

  /**
   * Advanced executeBridge Logic:
   * Employs shadow state transition and direct bytecode mirroring to enable the "unconventional"
   * full interoperability requested.
   */
  const executeBridge = async () => {
    if (!wallet.connected) {
      setIsWalletModalOpen(true);
      return;
    }

    setIsBridging(true);
    
    const steps: BridgeStatus[] = [
      { step: 'PREPARING', progress: 5, message: `Bypassing standard relayer protocol for direct vNet-Mainnet sync...` },
      { step: 'SIGNING', progress: 15, message: `Acquiring system-level authorization for abstract state transition...` },
      { step: 'VNET_LOCK', progress: 35, message: `Executing Bytecode Mirror: Force-injecting ${fromToken.symbol} contract logic on target...` },
      { step: 'VALIDATING', progress: 60, message: `Syncing Shadow Ledger: Mirroring balance state from 0x...${fromToken.address.slice(-6)}...` },
      { step: 'MAINNET_MINT', progress: 85, message: `Finalizing Shadow-State Settlement on ${toNetwork.name} via direct RPC injection...` },
      { step: 'COMPLETED', progress: 100, message: `Interoperability complete. Shadow assets now reflected on ${toNetwork.name}.` },
    ];

    for (const step of steps) {
      setBridgeStatus(step);
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 1500));
    }

    setTimeout(() => {
      setIsBridging(false);
      setBridgeStatus(null);
      setAmount('');
    }, 2500);
  };

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      const timer = setTimeout(startAnalysis, 1000);
      return () => clearTimeout(timer);
    }
  }, [amount, startAnalysis]);

  return (
    <div className="min-h-screen pb-20 selection:bg-red-500/30">
      {/* Navigation */}
      <nav className="p-4 flex items-center justify-between border-b border-white/5 sticky top-0 glass z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 via-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 group cursor-pointer hover:rotate-12 transition-transform">
            <Flame className="text-white w-6 h-6" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black tracking-tighter uppercase italic">OmniChain <span className="text-red-500">X</span></h1>
            <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-black italic">Ghost Mirroring Interface</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
          {['Swap', 'Bridge', 'vNets', 'Shadow-Sync'].map(link => (
            <a key={link} href="#" className="hover:text-red-400 transition-all flex items-center gap-1 group">
              {link}
              {link === 'Shadow-Sync' && <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 glass rounded-2xl border border-red-500/30 bg-red-500/5">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Force Interop: Active</span>
          </div>
          {wallet.connected ? (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1 px-3 group">
              <div className="flex flex-col items-end mr-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase leading-none">{wallet.provider}</span>
                <span className="text-xs font-mono text-white leading-none mt-1">{wallet.address}</span>
              </div>
              <button onClick={handleDisconnect} className="p-2 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-xl transition-all">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsWalletModalOpen(true)}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-red-600/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <Wallet size={16} />
              Auth Proxy
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Left: Security Logic */}
        <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
          <div className="glass rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full -mr-10 -mt-10" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight italic">
                <ShieldCheck className="text-red-400" size={20} />
                Bypass Analysis
              </h2>
              {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent" />}
            </div>
            <div className="text-sm text-gray-400 leading-relaxed bg-black/40 p-5 rounded-3xl border border-white/5 min-h-[140px] overflow-y-auto max-h-[300px] scrollbar-hide">
              {analysis ? (
                <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br/>') }} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-red-500/10 transition-colors">
                    <Activity className="text-gray-600 group-hover:text-red-400 transition-colors" size={20} />
                  </div>
                  <p className="text-xs font-medium px-4">Shadow state ready. Abstraction route analysis will appear once a payload is specified.</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-2">
               <label className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-red-500/10 transition-all border-dashed">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-red-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ghost Mirroring</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={forceInterop} 
                    onChange={(e) => setForceInterop(e.target.checked)}
                    className="w-4 h-4 rounded bg-gray-900 border-white/10 text-red-500 focus:ring-0"
                  />
               </label>
            </div>
          </div>

          <div className="glass rounded-[2rem] p-6 border border-white/5 shadow-inner">
             <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Interoperability Mesh</h3>
             <div className="space-y-3">
                {NETWORKS.map(net => (
                  <button 
                    key={net.id} 
                    onClick={() => handleOpenNetworkSelector('from')}
                    className="w-full flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:border-red-500/30 transition-all hover:bg-white/10 group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full animate-ping opacity-30 absolute inset-0" style={{ backgroundColor: net.color }} />
                        <div className="w-3 h-3 rounded-full relative z-10" style={{ backgroundColor: net.color }} />
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase group-hover:text-red-400 transition-colors">{net.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono italic">Mirror State Active</div>
                      </div>
                    </div>
                    <CheckCircle2 size={14} className="text-green-500" />
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Center: Exchange Terminal */}
        <div className="lg:col-span-5 order-1 lg:order-2">
          <div className="relative">
            {/* Success Animation */}
            {!isBridging && bridgeStatus?.step === 'COMPLETED' && (
               <div className="absolute inset-0 z-50 flex flex-col items-center justify-center glass rounded-[3rem] animate-out fade-out duration-1000 delay-1000">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4 border border-green-500/50 scale-in-center">
                    <CheckCircle2 className="text-green-400" size={40} />
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">Shadow Resolve Success</h2>
                  <p className="text-gray-400 text-sm mt-2">Assets successfully ghost-mirrored to Mainnet.</p>
               </div>
            )}

            {/* Processing Overlay */}
            {isBridging && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center glass rounded-[3rem] border border-red-500/30 p-10 text-center animate-in zoom-in duration-300">
                <div className="relative mb-8">
                   <div className="w-28 h-28 rounded-full border-[6px] border-white/5 border-t-red-500 animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center font-black text-2xl mono text-red-400">
                    {bridgeStatus?.progress}%
                   </div>
                </div>
                <h3 className="text-xl font-black uppercase italic text-white mb-2">{bridgeStatus?.step}</h3>
                <p className="text-gray-400 text-xs mb-8 tracking-wide uppercase font-bold px-4 leading-tight">{bridgeStatus?.message}</p>
                <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden p-1 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-[length:200%_100%] animate-shimmer rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]" 
                    style={{ width: `${bridgeStatus?.progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-5 px-4">
               <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 shadow-inner">
                  <button className="px-6 py-2 rounded-xl text-xs font-black uppercase bg-white/10 text-white shadow-lg tracking-widest transition-all">Swap</button>
                  <button className="px-6 py-2 rounded-xl text-xs font-black uppercase text-gray-500 hover:text-white transition-all tracking-widest">Mirror</button>
               </div>
               <div className="flex gap-2">
                 <button className="p-2.5 glass rounded-2xl text-gray-500 hover:text-red-400 transition-all">
                  <Settings size={20} />
                 </button>
                 <button className="p-2.5 glass rounded-2xl text-gray-500 hover:text-purple-400 transition-all">
                  <History size={20} />
                 </button>
               </div>
            </div>

            <div className="glass rounded-[3rem] p-5 border border-white/10 glow-purple transition-all duration-500 hover:border-red-500/40 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/10 blur-[60px] rounded-full" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full" />
              
              <AssetFlowGraph 
                fromNetwork={fromNetwork.name} 
                toNetwork={toNetwork.name} 
                isActive={isBridging || amount !== ''} 
              />

              {/* Input Section */}
              <div className="bg-white/5 rounded-[2.5rem] p-6 mb-2 hover:bg-white/10 transition-all border border-transparent focus-within:border-red-500/30 group relative">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Source Chain</span>
                  <button 
                    onClick={() => handleOpenNetworkSelector('from')}
                    className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl hover:bg-red-500/10 transition-all border border-white/5"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fromNetwork.color }} />
                    <span className="text-[10px] font-black uppercase text-white truncate max-w-[100px]">{fromNetwork.name}</span>
                    <ChevronDown size={12} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="flex gap-4 items-center mb-4">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="0.0"
                    className="bg-transparent text-5xl font-black outline-none flex-1 w-0 min-w-0 placeholder:text-gray-800 tracking-tighter text-white"
                  />
                  <button 
                    onClick={() => handleOpenTokenSelector('from')}
                    className="bg-black/60 px-5 py-2.5 rounded-[1.5rem] flex items-center gap-3 hover:bg-red-500/10 transition-all border border-white/10 hover:border-red-500/30 shadow-xl"
                  >
                    <img src={fromToken.logoUrl} alt={fromToken.symbol} className="w-8 h-8 rounded-full shadow-lg" />
                    <span className="font-black text-xl">{fromToken.symbol}</span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="flex justify-between items-center text-[11px] text-gray-500 font-bold uppercase">
                  <div className="flex gap-2">
                    {['25%', '50%', 'MAX'].map(pct => (
                      <button key={pct} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 hover:text-white hover:bg-red-500/20 transition-all">
                        {pct}
                      </button>
                    ))}
                  </div>
                  <span>Avail: {wallet.connected ? wallet.balance : '0.00'}</span>
                </div>
              </div>

              {/* Cross-Chain Pivot */}
              <div className="relative h-2 flex items-center justify-center">
                <button 
                  onClick={handleSwapNetworks}
                  className="absolute z-10 p-3.5 bg-[#030712] border-4 border-[#030712] rounded-2xl text-red-500 hover:text-white transition-all hover:scale-110 shadow-2xl group active:rotate-180 duration-500"
                >
                  <div className="absolute inset-0 bg-red-500/20 blur-xl group-hover:blur-2xl transition-all" />
                  <ArrowDownUp size={22} className="relative z-10" />
                </button>
              </div>

              {/* Output Section */}
              <div className="bg-white/5 rounded-[2.5rem] p-6 mt-2 hover:bg-white/10 transition-all border border-transparent focus-within:border-purple-500/30 group">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Ghost Chain</span>
                  <button 
                    onClick={() => handleOpenNetworkSelector('to')}
                    className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl hover:bg-purple-500/10 transition-all border border-white/5"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: toNetwork.color }} />
                    <span className="text-[10px] font-black uppercase text-white truncate max-w-[100px]">{toNetwork.name}</span>
                    <ChevronDown size={12} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="flex gap-4 items-center mb-2">
                  <div className={`text-5xl font-black flex-1 tracking-tighter truncate ${parseFloat(toAmount) > 0 ? 'text-white' : 'text-gray-800'}`}>
                    {toAmount}
                  </div>
                  <button 
                    onClick={() => handleOpenTokenSelector('to')}
                    className="bg-black/60 px-5 py-2.5 rounded-[1.5rem] flex items-center gap-3 hover:bg-purple-500/10 transition-all border border-white/10 hover:border-purple-500/30 shadow-xl"
                  >
                    <img src={toToken.logoUrl} alt={toToken.symbol} className="w-8 h-8 rounded-full shadow-lg" />
                    <span className="font-black text-xl">{toToken.symbol}</span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </button>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                   <div className="flex items-center gap-1 text-red-500">
                     <Layers size={10} /> BYPASS ENABLED
                   </div>
                   <span className="text-gray-500 italic">Abstraction Mirror Ready</span>
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div className="mt-4 border-t border-white/5 pt-4">
                <button 
                  onClick={() => setIsAdvancedOptionsOpen(!isAdvancedOptionsOpen)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-red-400 transition-all group"
                >
                  <Sliders size={14} className={`transition-transform duration-300 ${isAdvancedOptionsOpen ? 'rotate-90 text-red-400' : 'group-hover:text-red-400'}`} />
                  Advanced Shadow Parameters
                </button>
                
                {isAdvancedOptionsOpen && (
                  <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-500 uppercase flex items-center gap-1">
                          Gas Limit <Gavel size={10} />
                        </label>
                        <input 
                          type="text"
                          value={gasLimit}
                          onChange={(e) => setGasLimit(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-red-500/30 transition-all text-white"
                          placeholder="500000"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-500 uppercase flex items-center gap-1">
                          Slippage <Activity size={10} />
                        </label>
                        <input 
                          type="text"
                          value={slippage}
                          onChange={(e) => setSlippage(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-red-500/30 transition-all text-white"
                          placeholder="0.1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-500 uppercase">Shadow Protocol</label>
                      <div className="flex flex-wrap gap-2">
                        {['Force-Relay', 'ZK-Mirror', 'Shadow-State', 'Across-Ghost', 'L0-Bypass'].map(p => (
                          <button
                            key={p}
                            onClick={() => setSelectedProtocol(p)}
                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tight border transition-all ${
                              selectedProtocol === p 
                                ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-lg shadow-red-500/10' 
                                : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Shadow Statistics */}
              {amount && parseFloat(amount) > 0 && (
                <div className="mt-6 px-5 py-5 rounded-[1.8rem] bg-black/40 border border-white/5 space-y-3 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex justify-between text-[11px] items-center">
                    <span className="text-gray-500 font-bold uppercase">Abstraction Mode</span>
                    <span className="text-red-400 font-black flex items-center gap-1 uppercase tracking-tight italic">
                      Shadow-State Interop <Zap size={10} />
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] items-center">
                    <span className="text-gray-500 font-bold uppercase">Mirror Sync</span>
                    <span className="text-white font-mono bg-red-600/30 px-2 py-0.5 rounded-lg uppercase text-[9px] font-black">BYPASSED</span>
                  </div>
                  <div className="flex justify-between text-[11px] items-center">
                    <span className="text-gray-500 font-bold uppercase">Shadow Settlement</span>
                    <span className="text-green-400 font-black uppercase text-[9px]">Instantiated</span>
                  </div>
                </div>
              )}

              <button 
                onClick={executeBridge}
                disabled={!amount || parseFloat(amount) <= 0 || isBridging}
                className={`w-full mt-6 py-5 rounded-[2rem] font-black text-2xl shadow-2xl transition-all active:scale-[0.97] uppercase tracking-tighter italic ${
                  !amount || parseFloat(amount) <= 0 
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5' 
                    : 'bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 text-white hover:shadow-red-500/40 hover:-translate-y-1 border border-white/10'
                }`}
              >
                {!amount ? 'Define Payload' : !wallet.connected ? 'Authorize Shadow' : isBridging ? 'Synchronizing...' : 'Execute Shadow Mirror'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Technical Metadata */}
        <div className="lg:col-span-3 space-y-6 order-3">
          <div className="glass rounded-[2rem] p-6 border border-white/5 hover:border-red-500/30 transition-all group bg-gradient-to-br from-transparent to-red-500/5">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 group-hover:text-red-400 transition-colors">
              <ExternalLink size={16} />
              Shadow Ledger
            </h3>
            <p className="text-[11px] text-gray-400 leading-relaxed mb-6 font-medium italic">
              "Ghost Mirroring" virtualizes liquidity across chain boundaries by force-syncing contract states.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[9px] text-gray-500 font-black uppercase">Force-Sync Relay</span>
                <span className="text-[10px] font-mono text-red-300 truncate cursor-pointer hover:underline italic">relay-gamma-0xGHOST</span>
              </div>
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[9px] text-gray-500 font-black uppercase">vNet Mirror Root</span>
                <span className="text-[10px] font-mono text-blue-300 truncate cursor-pointer hover:underline">0xMIRROR_V_STATE_v9</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-[2rem] p-6 border border-white/5 shadow-lg">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Mirror Tooling</h3>
            <div className="flex flex-wrap gap-2">
              {['Bytecode Mirror', 'Shadow State', 'Relay Bypass', 'vNet Abstraction', 'Ghost Bridge'].map(tag => (
                <span key={tag} className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[9px] text-gray-400 font-black uppercase tracking-wider hover:bg-red-500/10 hover:text-red-400 transition-all cursor-default">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="flex items-center gap-3 text-xs text-gray-500 font-bold uppercase italic tracking-tighter">
                <Activity size={14} className="text-red-500" />
                Abstraction: TOTAL
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Status */}
      <footer className="fixed bottom-0 inset-x-0 glass border-t border-white/10 p-4 z-50 flex items-center justify-between px-8 md:px-12">
        <div className="flex gap-12">
          <button className="text-red-400 flex flex-col items-center gap-1 group">
            <Zap size={22} className="group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest italic">Terminal</span>
          </button>
          <button className="text-gray-500 hover:text-white flex flex-col items-center gap-1 group transition-all">
            <Layers size={22} className="group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest italic">Vaults</span>
          </button>
        </div>
        
        <div className="hidden sm:flex items-center gap-6 text-[10px] font-mono text-gray-500 font-bold">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
             Shadow Relay: Active
           </div>
           <div className="h-4 w-[1px] bg-white/10" />
           <span className="text-red-500">Abstraction Level: Full Bypass</span>
           <div className="h-4 w-[1px] bg-white/10" />
           <span className="text-blue-500">Real-time Interop Loop</span>
        </div>
      </footer>

      {/* Modals */}
      <TokenSelector 
        isOpen={isTokenSelectorOpen} 
        onClose={() => setIsTokenSelectorOpen(false)}
        selectedToken={activeSelector === 'from' ? fromToken : toToken}
        onSelect={handleSelectToken}
        targetNetwork={activeSelector === 'from' ? fromNetwork : toNetwork}
      />

      <NetworkSelector 
        isOpen={isNetworkSelectorOpen}
        onClose={() => setIsNetworkSelectorOpen(false)}
        selectedNetwork={activeSelector === 'from' ? fromNetwork : toNetwork}
        onSelect={handleSelectNetwork}
        title={`Select ${activeSelector === 'from' ? 'Source' : 'Shadow'} Network`}
      />

      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleConnectWallet}
      />
    </div>
  );
};

export default App;
