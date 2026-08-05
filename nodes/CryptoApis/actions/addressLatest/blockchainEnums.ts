/**
 * Per-operation blockchain/network enum override for addressLatest.
 * getNextNonce is the only operation narrower than the full EVM_BLOCKCHAINS/EVM_NETWORKS union --
 * every other EVM operation here (balance, transactions, tokens-transfers, internal-transactions)
 * genuinely supports all 9 EVM chains per the spec.
 */

export const EVM_NEXT_NONCE_BLOCKCHAINS = ['ethereum', 'ethereum-classic', 'binance-smart-chain'] as const;
export const EVM_NEXT_NONCE_NETWORKS = ['mainnet', 'mordor', 'testnet', 'sepolia'] as const;
