// src/components/StarknetReadOnlyPanel.jsx
import React, { useMemo, useState } from 'react';
import { Box, Button, Divider, Link, Stack, TextField, Typography } from '@mui/material';
import { RpcProvider, Contract } from 'starknet';
import { STARKNET_NETWORK } from '../contracts/StarknetFactoryConfig';
import { shortAddr, explorerContractUrl } from '../utils/starknet';

// Minimal ABI for read-only get_chama(id) -> address and get_vault(id) -> address
const factoryAbi = [
  {
    name: 'get_chama',
    type: 'function',
    state_mutability: 'view',
    inputs: [{ name: 'id', type: 'core::integer::u64' }],
    outputs: [{ type: 'core::starknet::contract_address::ContractAddress' }],
  },
  {
    name: 'get_vault',
    type: 'function',
    state_mutability: 'view',
    inputs: [{ name: 'id', type: 'core::integer::u64' }],
    outputs: [{ type: 'core::starknet::contract_address::ContractAddress' }],
  },
];

export default function StarknetReadOnlyPanel() {
  const provider = useMemo(() => new RpcProvider({ nodeUrl: STARKNET_NETWORK.rpcUrl }), []);
  const [id, setId] = useState('1');
  const [core, setCore] = useState('');
  const [vault, setVault] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    try {
      setLoading(true);
      setError('');
      const contract = new Contract(factoryAbi, STARKNET_NETWORK.factoryAddress, provider);
      const coreRes = await contract.get_chama(id);
      const vaultRes = await contract.get_vault(id);
      setCore(String(coreRes));
      setVault(String(vaultRes));
    } catch (e) {
      setError(e.message || String(e));
      setCore('');
      setVault('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>Starknet Read-Only</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Connected to {STARKNET_NETWORK.name}. Query Factory.get_chama/get_vault.
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField label="Chama ID" size="small" value={id} onChange={(e) => setId(e.target.value)} />
        <Button variant="contained" onClick={handleQuery} disabled={loading}>
          {loading ? 'Querying...' : 'Query'}
        </Button>
      </Stack>
      <Divider sx={{ my: 2 }} />
      {error ? (
        <Typography variant="caption" color="error">{error}</Typography>
      ) : (
        <Stack spacing={1}>
          <Typography variant="caption">Core: {core ? (
            <Link href={explorerContractUrl(core)} target="_blank" rel="noopener">
              {shortAddr(core)}
            </Link>
          ) : '—'}</Typography>
          <Typography variant="caption">Vault: {vault ? (
            <Link href={explorerContractUrl(vault)} target="_blank" rel="noopener">
              {shortAddr(vault)}
            </Link>
          ) : '—'}</Typography>
        </Stack>
      )}
    </Box>
  );
}

