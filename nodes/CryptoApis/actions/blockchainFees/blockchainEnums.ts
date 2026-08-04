/**
 * Per-operation blockchain/network enums for blockchainFees, sourced from the live OpenAPI spec.
 * Support genuinely differs per operation on this resource -- e.g. contract-interaction gas
 * estimation explicitly EXCLUDES ethereum/ethereum-classic/binance-smart-chain (only 6 of 9 EVM
 * chains support it), while eip-1559 only exists for 5 chains.
 */

export const EVM_MEMPOOL_BLOCKCHAINS = ['ethereum', 'ethereum-classic', 'binance-smart-chain', 'polygon', 'optimism', 'arbitrum', 'base', 'avalanche'] as const;
export const EVM_MEMPOOL_NETWORKS = ['mainnet', 'mordor', 'testnet', 'sepolia', 'amoy', 'fuji'] as const;

export const EVM_EIP1559_BLOCKCHAINS = ['ethereum', 'polygon', 'optimism', 'arbitrum', 'base'] as const;
export const EVM_EIP1559_NETWORKS = ['mainnet', 'sepolia', 'amoy'] as const;

export const EVM_NATIVE_COIN_GAS_BLOCKCHAINS = ['ethereum', 'ethereum-classic', 'binance-smart-chain', 'arbitrum', 'avalanche', 'base', 'optimism', 'polygon', 'tron'] as const;
export const EVM_NATIVE_COIN_GAS_NETWORKS = ['mainnet', 'mordor', 'testnet', 'sepolia', 'fuji', 'amoy', 'nile'] as const;

export const EVM_TOKEN_GAS_BLOCKCHAINS = EVM_NATIVE_COIN_GAS_BLOCKCHAINS;
export const EVM_TOKEN_GAS_NETWORKS = EVM_NATIVE_COIN_GAS_NETWORKS;

/** Excludes ethereum/ethereum-classic/binance-smart-chain entirely -- only 6 of 9 EVM chains support contract-interaction gas estimation. */
export const EVM_CONTRACT_GAS_BLOCKCHAINS = ['arbitrum', 'avalanche', 'base', 'optimism', 'polygon', 'tron'] as const;
export const EVM_CONTRACT_GAS_NETWORKS = ['sepolia', 'mainnet', 'fuji', 'amoy', 'nile'] as const;

export const UTXO_MEMPOOL_BLOCKCHAINS = ['bitcoin', 'bitcoin-cash', 'dogecoin', 'dash', 'litecoin', 'zcash'] as const;
export const UTXO_MEMPOOL_NETWORKS = ['mainnet', 'testnet'] as const;

/** Only 3 of 6 UTXO chains support the smart-fee endpoint -- excludes bitcoin-cash/dogecoin/zcash. */
export const UTXO_SMART_FEE_BLOCKCHAINS = ['bitcoin', 'litecoin', 'dash'] as const;
export const UTXO_SMART_FEE_NETWORKS = ['testnet', 'mainnet'] as const;
