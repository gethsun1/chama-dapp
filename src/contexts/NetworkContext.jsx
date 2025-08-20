// src/contexts/NetworkContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const Networks = {
  EVM_SCROLL: 'EVM_SCROLL',
  STARKNET: 'STARKNET',
};

const STORAGE_KEY = 'networkSelected';

const NetworkContext = createContext({
  selected: Networks.EVM_SCROLL,
  setSelected: () => {},
});

export const NetworkProvider = ({ children }) => {
  const [selected, setSelected] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === Networks.STARKNET ? Networks.STARKNET : Networks.EVM_SCROLL;
    } catch {
      return Networks.EVM_SCROLL;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, selected);
    } catch {}
  }, [selected]);

  const value = useMemo(() => ({ selected, setSelected }), [selected]);
  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
};

export const useNetwork = () => useContext(NetworkContext);

