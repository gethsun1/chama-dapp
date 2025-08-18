# ChamaDapp Starknet (Phase 0)

This package contains the Starknet Cairo 2 implementation for ChamaDapp. Phase 0 targets feature parity for core flows with a Cairo-native architecture.

## Tech
- Cairo 2 + Scarb
- Starknet Foundry (snforge) for tests
- Contracts: ChamaFactory, ChamaCore, (Vault TBD)

## Commands
```
cd starknet
scarb build
snforge test
```

## Next Steps
- Wire UDC deployment in Factory
- Implement ERC-20 transfers (approve/transferFrom) and a simple Vault
- Add events and Apibara indexing schema
- Integrate starknet.js in frontend behind a network toggle

