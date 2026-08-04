/**
 * Per-operation blockchain/network enums for utils, sourced from the live OpenAPI spec.
 * validateAddress (EVM) and decodeRawTransaction (EVM) support narrower chain sets than the
 * package-wide EVM_BLOCKCHAINS union — see blockchainConstants.ts for that union's other uses.
 */

export const EVM_VALIDATE_ADDRESS_BLOCKCHAINS = ['ethereum', 'ethereum-classic', 'binance-smart-chain', 'tron'] as const;
export const EVM_VALIDATE_ADDRESS_NETWORKS = ['mainnet', 'testnet', 'mordor', 'nile', 'sepolia'] as const;

export const EVM_DECODE_RAW_TRANSACTION_BLOCKCHAINS = ['ethereum', 'ethereum-classic', 'binance-smart-chain'] as const;

/** UTXO decodeRawTransaction and validateAddress both accept the full 6-chain UTXO union — no narrowing needed there. */
