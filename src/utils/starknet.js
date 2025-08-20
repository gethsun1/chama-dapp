// src/utils/starknet.js
import { STARKNET_NETWORK } from '../contracts/StarknetFactoryConfig';

export function toHexString(addr) {
  try {
    const s = typeof addr === 'string' ? addr : String(addr);
    return s;
  } catch (_) {
    return String(addr);
  }
}

export function shortAddr(addr, size = 6) {
  const s = toHexString(addr);
  if (!s || s.length <= 2 * size + 2) return s;
  return `${s.slice(0, size + 2)}...${s.slice(-size)}`;
}

export function explorerContractUrl(address) {
  const s = toHexString(address);
  return `${STARKNET_NETWORK.explorerBase}/contract/${s}`;
}

export function explorerTxnUrl(txHash) {
  return `${STARKNET_NETWORK.explorerBase}/tx/${txHash}`;
}

export function isValidStarknetAddress(value) {
  if (!value) return false;
  if (value === '0x0') return true;
  if (typeof value !== 'string') return false;
  if (!value.startsWith('0x')) return false;
  const hex = value.slice(2);
  if (!/^[0-9a-fA-F]+$/.test(hex)) return false;
  // Starknet addresses are felts; up to 251 bits (~63 hex chars). Allow up to 64.
  return hex.length >= 1 && hex.length <= 64;
}

