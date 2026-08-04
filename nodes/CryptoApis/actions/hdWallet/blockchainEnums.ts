/**
 * Per-operation blockchain/network enums for hdWallet, sourced from the live OpenAPI spec.
 * HD wallets support a genuinely narrower chain set than the package-wide EVM_BLOCKCHAINS/
 * ALL_BLOCKCHAINS unions — e.g. polygon/avalanche/arbitrum/base/optimism have no HD-wallet
 * endpoints at all, and the Management family additionally includes xrp (which the generic
 * ALL_BLOCKCHAINS union omits, since it's EVM+UTXO only).
 */

export const MANAGE_BLOCKCHAINS = [
	'bitcoin', 'bitcoin-cash', 'litecoin', 'dogecoin', 'dash', 'zcash',
	'ethereum', 'ethereum-classic', 'binance-smart-chain', 'tron', 'xrp',
] as const;

export const MANAGE_NETWORKS = ['mainnet', 'testnet', 'mordor', 'nile', 'sepolia'] as const;

export const EVM_HD_WALLET_BLOCKCHAINS = ['ethereum', 'ethereum-classic', 'binance-smart-chain', 'tron'] as const;
export const EVM_HD_WALLET_NETWORKS = ['mainnet', 'sepolia', 'mordor', 'testnet', 'nile'] as const;
