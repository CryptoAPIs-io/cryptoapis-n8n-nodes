/**
 * Per-operation blockchain/network enums for addressHistory, sourced from the live OpenAPI spec.
 * The spec declares support PER OPERATION, not globally — e.g. getStatistics (EVM) supports only
 * ethereum/ethereum-classic while listTransactions on the same resource supports 5 chains. A single
 * flat dropdown (as this resource had before) either over- or under-offers depending on the operation.
 */

export const MANAGE_BLOCKCHAINS = [
	'bitcoin', 'bitcoin-cash', 'dash', 'dogecoin', 'litecoin', 'zcash',
	'ethereum', 'ethereum-classic', 'binance-smart-chain', 'polygon', 'tron',
] as const;

/** sync/list-synced-addresses networks (activate/delete additionally accept the deprecated 'mumbai'). */
export const MANAGE_NETWORKS = ['mainnet', 'testnet', 'sepolia', 'mordor', 'amoy', 'nile'] as const;
export const MANAGE_ACTIVATE_DELETE_NETWORKS = ['mainnet', 'testnet', 'sepolia', 'mordor', 'amoy', 'nile', 'mumbai'] as const;

export const EVM_STATISTICS_BLOCKCHAINS = ['ethereum', 'ethereum-classic'] as const;
export const EVM_STATISTICS_NETWORKS = ['mainnet', 'sepolia', 'mordor'] as const;

export const EVM_TRANSACTIONS_BLOCKCHAINS = ['ethereum', 'ethereum-classic', 'binance-smart-chain', 'polygon', 'tron'] as const;
export const EVM_TRANSACTIONS_NETWORKS = ['mainnet', 'mordor', 'testnet', 'sepolia', 'amoy', 'nile'] as const;

export const EVM_TOKENS_TRANSFERS_BLOCKCHAINS = ['ethereum', 'ethereum-classic', 'binance-smart-chain', 'polygon', 'tron'] as const;
export const EVM_TOKENS_TRANSFERS_NETWORKS = ['mainnet', 'sepolia', 'amoy', 'nile', 'mordor', 'testnet'] as const;

export const EVM_INTERNAL_TRANSACTIONS_BLOCKCHAINS = ['ethereum', 'ethereum-classic', 'binance-smart-chain', 'polygon', 'tron'] as const;
export const EVM_INTERNAL_TRANSACTIONS_NETWORKS = ['mainnet', 'sepolia', 'amoy', 'nile', 'mordor', 'testnet'] as const;

export const EVM_TOKENS_BLOCKCHAINS = ['ethereum', 'ethereum-classic', 'binance-smart-chain', 'polygon', 'tron'] as const;
export const EVM_TOKENS_NETWORKS = ['mainnet', 'amoy', 'nile', 'sepolia', 'mordor', 'testnet'] as const;

export const UTXO_STATISTICS_BLOCKCHAINS = ['bitcoin', 'bitcoin-cash'] as const;
export const UTXO_STATISTICS_NETWORKS = ['mainnet', 'testnet'] as const;

export const UTXO_TRANSACTIONS_BLOCKCHAINS = ['bitcoin', 'bitcoin-cash', 'litecoin', 'dogecoin', 'dash', 'zcash'] as const;
export const UTXO_TRANSACTIONS_NETWORKS = ['mainnet', 'testnet'] as const;

export const UTXO_UNSPENT_OUTPUTS_BLOCKCHAINS = ['bitcoin', 'bitcoin-cash', 'litecoin', 'dash', 'dogecoin', 'zcash'] as const;
export const UTXO_UNSPENT_OUTPUTS_NETWORKS = ['mainnet', 'testnet'] as const;
