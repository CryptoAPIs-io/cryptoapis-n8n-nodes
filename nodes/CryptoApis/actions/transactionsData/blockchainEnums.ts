/**
 * Per-operation blockchain/network enums for transactionsData, sourced from the live OpenAPI spec.
 * Operation availability genuinely differs per blockchain type -- UTXO only has getTransactionDetails
 * and getRawTransactionData (no internal/logs/tokenTransfers at all); XRP/Solana/Kaspa only have
 * getTransactionDetails. The Operation dropdown's displayOptions gate on blockchainType to reflect this.
 */

export const EVM_DETAILS_BLOCKCHAINS = ['ethereum', 'ethereum-classic', 'binance-smart-chain', 'polygon', 'avalanche', 'arbitrum', 'base', 'optimism', 'tron'] as const;
export const EVM_DETAILS_NETWORKS = ['mainnet', 'mordor', 'testnet', 'sepolia', 'amoy', 'fuji', 'nile'] as const;

export const EVM_INTERNAL_BLOCKCHAINS = ['ethereum', 'binance-smart-chain', 'ethereum-classic', 'polygon', 'optimism', 'arbitrum', 'base', 'avalanche', 'tron'] as const;
export const EVM_INTERNAL_NETWORKS = ['mainnet', 'testnet', 'mordor', 'sepolia', 'amoy', 'fuji', 'nile'] as const;

export const EVM_LOGS_BLOCKCHAINS = ['ethereum'] as const;
export const EVM_LOGS_NETWORKS = ['mainnet', 'sepolia'] as const;

export const EVM_TOKENS_TRANSFERS_BLOCKCHAINS = ['ethereum', 'ethereum-classic', 'binance-smart-chain', 'polygon', 'optimism', 'arbitrum', 'base', 'avalanche', 'tron'] as const;
export const EVM_TOKENS_TRANSFERS_NETWORKS = ['mainnet', 'mordor', 'testnet', 'sepolia', 'amoy', 'fuji', 'nile'] as const;

export const UTXO_DETAILS_BLOCKCHAINS = ['bitcoin', 'bitcoin-cash', 'litecoin', 'dogecoin', 'dash', 'zcash'] as const;
export const UTXO_DETAILS_NETWORKS = ['mainnet', 'testnet'] as const;

/** raw-data excludes zcash -- the only UTXO transactionsData operation with a narrower enum. */
export const UTXO_RAW_DATA_BLOCKCHAINS = ['bitcoin', 'bitcoin-cash', 'litecoin', 'dogecoin', 'dash'] as const;
export const UTXO_RAW_DATA_NETWORKS = ['mainnet', 'testnet'] as const;
