// src/config.jsx
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { mainnet } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import React from 'react';


const queryClient = new QueryClient();

const projectId = '3268c03bffd8e52c1b26452048d2ce4c';


const metadata = {
  name: 'Chama Dapp',
  description: 'A Blockchain Table Banking Savings Dapp',
  url: 'https://chama-dapp.vercel.app/',
  icons: ['https://i.ibb.co/0jZ4BfL/chama-logo.png'], // Updated to direct image URL
};


const scrollSepolia = {
  id: 534351,
  name: 'Scroll Sepolia',
  network: 'scroll-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rpc.scroll.io'],
    },
    public: {
      http: ['https://sepolia-rpc.scroll.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ScrollScan',
      url: 'https://sepolia.scrollscan.com',
    },
  },
  testnet: true,
};

const networks = [scrollSepolia]; 


const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});


createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true,
  },
});


export function AppKitProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
