// src/contracts/StarknetFactoryConfig.js
// Deployed on Starknet Sepolia
// Factory deployed via sncast; see README for details

export const STARKNET_NETWORK = {
  name: 'Starknet Sepolia',
  explorerBase: 'https://sepolia.starkscan.co',
  rpcUrl: 'https://starknet-sepolia.public.blastapi.io/rpc/v0_8',
  factoryAddress:
    '0x054a4299170e89bdd10e63aa1558ded3f9237fd4ff01795fec0f0f4ee54ad8c3',
  // Optional: class hashes for reference
  classHashes: {
    core: '0x798c17a478bf9786e6d42e87b406a3fe13566d50fd3bcbd6d9bfdd29fa6a98a',
    factory:
      '0x64345390d13dfa59a9be1606f4cd96d1095b6795a33570f55d577a34fa5d8aa',
    vault:
      '0x1f42b0f0a1ea41f90d35a3a134633797aeaf173cd13a45466c42e60ec9092b5',
  },
};

