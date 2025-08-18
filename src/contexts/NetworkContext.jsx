// src/contexts/NetworkContext.jsx
import React, { createContext, useContext, useMemo, useState } from 'react';

export const Networks = {
  EVM_SCROLL: 'EVM_SCROLL',
  STARKNET: 'STARKNET',
};

const NetworkContext = createContext({
  selected: Networks.EVM_SCROLL,
  setSelected: () => {},
});

export const NetworkProvider = ({ children }) => {
  const [selected, setSelected] = useState(Networks.EVM_SCROLL);
  const value = useMemo(() => ({ selected, setSelected }), [selected]);
  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
};

export const useNetwork = () => useContext(NetworkContext);

