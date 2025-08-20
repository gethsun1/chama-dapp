// src/components/RecentStarknetChamas.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Grid, Link, TextField, Typography } from '@mui/material';
import { RpcProvider, Contract } from 'starknet';
import { STARKNET_NETWORK } from '../contracts/StarknetFactoryConfig';
import { shortAddr, explorerContractUrl } from '../utils/starknet';

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

export default function RecentStarknetChamas() {
  const provider = useMemo(() => new RpcProvider({ nodeUrl: STARKNET_NETWORK.rpcUrl }), []);
  const [maxId, setMaxId] = useState(5);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const c = new Contract(factoryAbi, STARKNET_NETWORK.factoryAddress, provider);
        const results = [];
        for (let i = 1; i <= maxId; i++) {
          try {
            const core = await c.get_chama(i);
            const vault = await c.get_vault(i);
            results.push({ id: i, core: String(core), vault: String(vault) });
          } catch (e) {
            results.push({ id: i, core: '0x0', vault: '0x0' });
          }
        }
        if (active) setItems(results);
      } catch (e) {
        if (active) setItems([]);
      }
    })();
    return () => { active = false; };
  }, [provider, maxId]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Starknet Chamas</Typography>
        <TextField
          label="Max ID"
          size="small"
          type="number"
          value={maxId}
          onChange={(e) => setMaxId(Math.max(1, Number(e.target.value) || 1))}
          sx={{ width: 120 }}
        />
      </Box>
      <Grid container spacing={2}>
        {items.map((it) => (
          <Grid item xs={12} md={6} key={it.id}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Chama #{it.id}</Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Core: {it.core !== '0x0' ? (
                    <Link href={explorerContractUrl(it.core)} target="_blank" rel="noopener">{shortAddr(it.core)}</Link>
                  ) : '—'}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Vault: {it.vault !== '0x0' ? (
                    <Link href={explorerContractUrl(it.vault)} target="_blank" rel="noopener">{shortAddr(it.vault)}</Link>
                  ) : '—'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

