// src/contracts/StarknetFactoryConfig.js
// Deployed on Starknet Sepolia
// Factory deployed via sncast; see README for details

export const STARKNET_NETWORK = {
  name: 'Starknet Sepolia',
  explorerBase: 'https://sepolia.starkscan.co',
  rpcUrl: 'https://starknet-sepolia.public.blastapi.io/rpc/v0_8',
  factoryAddress:
    '0x013a4210e9db58c72a3506629455333dec9544dd27208ec49bbb98670409ed14',
  // Optional: class hashes for reference
  classHashes: {
    core: '0x798c17a478bf9786e6d42e87b406a3fe13566d50fd3bcbd6d9bfdd29fa6a98a',
    factory:
      '0x38d4c6f97ec331b19a570a9b02ddd47841d0f63065cf572cbbb3af5c52c05bf',
    vault:
      '0x1f42b0f0a1ea41f90d35a3a134633797aeaf173cd13a45466c42e60ec9092b5',
  },
};

