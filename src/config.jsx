// src/config.jsx
import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { scrollSepolia, scroll } from '@reown/appkit/networks';

// Prefer environment variable, fall back to current public projectId to avoid breaking dev
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || '3268c03bffd8e52c1b26452048d2ce4c';
if (!import.meta.env.VITE_REOWN_PROJECT_ID) {
  // eslint-disable-next-line no-console
  console.warn('VITE_REOWN_PROJECT_ID is not set. Using bundled fallback projectId.');
}
const networks = [scrollSepolia, scroll];

const metadata = {
  name: 'Chama Dapp v2',
  description: 'A decentralized group savings platform',
  url: 'https://chama-dapp.vercel.app/',
  icons: ['https://i.ibb.co/0jZ4BfL/chama-logo.png'],
};

// Initialize AppKit once at the root level
createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  metadata,
  projectId,
  themeMode: 'dark',
  features: {
    analytics: true,
  },
  themeVariables: {
    '--w3m-accent': '#000000',
  },
});

export default function AppKitConfig() {
  return null;
}
