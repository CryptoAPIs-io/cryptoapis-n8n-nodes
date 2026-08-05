/**
 * The 8 event types blockchain_events create-subscription actually supports, each its own
 * dedicated endpoint (/blockchain-events/{blockchain}/{network}/{event-slug}) with its own
 * blockchain/network support and request body shape. There is no generic create-any-event-type
 * endpoint. See sibling fix in cryptoapis-mcp's mcp-blockchain-events package (BL-0199) for the
 * same root cause and fix shape.
 */

export const EVENT_TYPES = [
	'address-coins-transactions-unconfirmed',
	'address-coins-transactions-confirmed',
	'address-coins-transactions-confirmed-each-confirmation',
	'address-tokens-transactions-confirmed',
	'address-tokens-transactions-confirmed-each-confirmation',
	'address-internal-transactions-confirmed',
	'address-internal-transactions-confirmed-each-confirmation',
	'block-mined',
] as const;

export const EVENT_TYPE_BLOCKCHAINS: Record<string, readonly string[]> = {
	'address-coins-transactions-unconfirmed': ['bitcoin', 'bitcoin-cash', 'dash', 'dogecoin', 'litecoin', 'zcash'],
	'address-coins-transactions-confirmed': [
		'bitcoin', 'bitcoin-cash', 'dash', 'dogecoin', 'litecoin', 'ethereum', 'ethereum-classic',
		'binance-smart-chain', 'zcash', 'polygon', 'tron', 'xrp', 'tezos', 'optimism', 'arbitrum',
		'avalanche', 'solana', 'base', 'kaspa',
	],
	'address-coins-transactions-confirmed-each-confirmation': [
		'bitcoin', 'bitcoin-cash', 'dash', 'dogecoin', 'litecoin', 'ethereum', 'ethereum-classic',
		'binance-smart-chain', 'zcash', 'polygon', 'tron', 'xrp', 'tezos', 'optimism', 'arbitrum',
		'avalanche', 'base',
	],
	'address-tokens-transactions-confirmed': [
		'ethereum', 'ethereum-classic', 'binance-smart-chain', 'polygon', 'tron', 'optimism',
		'arbitrum', 'avalanche', 'solana', 'base',
	],
	'address-tokens-transactions-confirmed-each-confirmation': [
		'bitcoin', 'ethereum', 'ethereum-classic', 'binance-smart-chain', 'polygon', 'tron',
		'optimism', 'arbitrum', 'avalanche', 'base',
	],
	'address-internal-transactions-confirmed': [
		'ethereum', 'ethereum-classic', 'binance-smart-chain', 'polygon', 'tron', 'optimism', 'arbitrum', 'avalanche', 'base',
	],
	'address-internal-transactions-confirmed-each-confirmation': [
		'ethereum', 'ethereum-classic', 'binance-smart-chain', 'polygon', 'tron', 'optimism', 'arbitrum', 'avalanche', 'base',
	],
	'block-mined': [
		'bitcoin', 'bitcoin-cash', 'dash', 'dogecoin', 'litecoin', 'ethereum', 'ethereum-classic',
		'binance-smart-chain', 'zcash', 'polygon', 'tron', 'xrp', 'tezos', 'optimism', 'arbitrum',
		'avalanche', 'solana', 'base',
	],
};

export const EVENT_TYPE_NETWORKS: Record<string, readonly string[]> = {
	'address-coins-transactions-unconfirmed': ['mainnet', 'testnet'],
	'address-coins-transactions-confirmed': ['mainnet', 'testnet', 'sepolia', 'mordor', 'amoy', 'nile', 'shadownet', 'fuji', 'devnet'],
	'address-coins-transactions-confirmed-each-confirmation': ['mainnet', 'testnet', 'sepolia', 'mordor', 'amoy', 'nile', 'shadownet', 'fuji'],
	'address-tokens-transactions-confirmed': ['mainnet', 'testnet', 'sepolia', 'mordor', 'amoy', 'nile', 'fuji', 'devnet'],
	'address-tokens-transactions-confirmed-each-confirmation': ['mainnet', 'testnet', 'sepolia', 'mordor', 'amoy', 'nile', 'fuji'],
	'address-internal-transactions-confirmed': ['mainnet', 'testnet', 'sepolia', 'mordor', 'amoy', 'nile', 'fuji'],
	'address-internal-transactions-confirmed-each-confirmation': ['mainnet', 'testnet', 'sepolia', 'mordor', 'amoy', 'nile', 'fuji'],
	'block-mined': ['mainnet', 'testnet', 'sepolia', 'mordor', 'amoy', 'nile', 'shadownet', 'fuji', 'devnet'],
};

/** Event types that require confirmationsCount (exact confirmation count to watch for). */
export const EVENT_TYPES_REQUIRING_CONFIRMATIONS_COUNT = new Set([
	'address-coins-transactions-confirmed-each-confirmation',
	'address-tokens-transactions-confirmed-each-confirmation',
	'address-internal-transactions-confirmed-each-confirmation',
]);

/**
 * All /blockchain-events/{blockchain}/{network}... management endpoints (list/get/delete/activate)
 * accept the same uniform 19-chain union.
 */
export const MANAGE_BLOCKCHAINS = [
	'bitcoin', 'bitcoin-cash', 'dash', 'dogecoin', 'litecoin', 'zcash',
	'ethereum', 'ethereum-classic', 'binance-smart-chain', 'polygon', 'tron',
	'xrp', 'tezos', 'optimism', 'arbitrum', 'avalanche', 'solana', 'base', 'kaspa',
] as const;

export const MANAGE_NETWORKS = [
	'mainnet', 'testnet', 'sepolia', 'mordor', 'amoy', 'nile', 'shadownet', 'fuji', 'devnet',
] as const;
