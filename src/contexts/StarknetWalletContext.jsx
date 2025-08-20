// src/contexts/StarknetWalletContext.jsx
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const StarknetWalletContext = createContext({
  isConnected: false,
  address: null,
  account: null,
  walletName: null,
  connect: async () => {},
  disconnect: () => {},
});

function detectWallet() {
  if (typeof window === 'undefined') return null;
  // Prefer explicit wallet globals if present
  const candidates = [
    window.starknet?.isPreauthorized ? window.starknet : null,
    window.starknet_argentX || null,
    window.starknet_braavos || null,
    window.starknet || null,
  ].filter(Boolean);
  return candidates[0] || null;
}

export const StarknetWalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [account, setAccount] = useState(null);
  const [walletName, setWalletName] = useState(null);

  const connect = useCallback(async () => {
    const wallet = detectWallet();
    if (!wallet) throw new Error('No Starknet wallet found. Please install Argent X or Braavos.');
    try {
      // enable() is supported by Argent X / Braavos. Fallback to requestAccounts.
      if (typeof wallet.enable === 'function') {
        await wallet.enable({ showModal: true });
      } else if (typeof wallet.request === 'function') {
        await wallet.request({ type: 'starknet_requestAccounts' });
      }
      const addr = wallet.selectedAddress || wallet.selected_address || wallet.account?.address;
      if (!addr) throw new Error('Unable to determine Starknet account address');
      setIsConnected(true);
      setAddress(addr);
      setAccount(wallet.account || wallet);
      setWalletName(wallet.id || wallet.name || 'starknet');
    } catch (e) {
      throw e;
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    setAccount(null);
    setWalletName(null);
  }, []);

  const value = useMemo(() => ({ isConnected, address, account, walletName, connect, disconnect }), [isConnected, address, account, walletName, connect, disconnect]);

  return (
    <StarknetWalletContext.Provider value={value}>
      {children}
    </StarknetWalletContext.Provider>
  );
};

export const useStarknetWallet = () => useContext(StarknetWalletContext);

