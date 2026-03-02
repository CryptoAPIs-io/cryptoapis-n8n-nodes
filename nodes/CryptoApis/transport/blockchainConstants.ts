/**
 * Blockchain → network mapping for CryptoAPIs.
 * Ported from @cryptoapis-io/mcp-shared.
 */

export const BLOCKCHAIN_NETWORKS: Record<string, readonly string[]> = {
	// EVM
	ethereum: ['mainnet', 'sepolia'],
	'ethereum-classic': ['mainnet', 'mordor'],
	'binance-smart-chain': ['mainnet', 'testnet'],
	polygon: ['mainnet', 'amoy'],
	tron: ['mainnet', 'nile'],
	avalanche: ['mainnet', 'fuji'],
	arbitrum: ['mainnet', 'sepolia'],
	base: ['mainnet', 'sepolia'],
	optimism: ['mainnet', 'sepolia'],
	// UTXO
	bitcoin: ['mainnet', 'testnet'],
	'bitcoin-cash': ['mainnet', 'testnet'],
	litecoin: ['mainnet', 'testnet'],
	dogecoin: ['mainnet', 'testnet'],
	dash: ['mainnet', 'testnet'],
	zcash: ['mainnet', 'testnet'],
} as const;

export const EVM_BLOCKCHAINS = [
	'ethereum',
	'ethereum-classic',
	'binance-smart-chain',
	'polygon',
	'avalanche',
	'arbitrum',
	'base',
	'optimism',
	'tron',
] as const;

export const UTXO_BLOCKCHAINS = [
	'bitcoin',
	'bitcoin-cash',
	'litecoin',
	'dogecoin',
	'dash',
	'zcash',
] as const;

export const EVM_NETWORKS = ['mainnet', 'sepolia', 'mordor', 'testnet', 'nile', 'amoy', 'fuji'] as const;
// Note: 'sepolia' is used by ethereum, arbitrum, optimism, and base
export const UTXO_NETWORKS = ['mainnet', 'testnet'] as const;
export const XRP_NETWORKS = ['mainnet', 'testnet'] as const;
export const SOLANA_NETWORKS = ['mainnet', 'devnet'] as const;

export const EVM_NETWORK_CHAIN_IDS: Record<string, Record<string, number>> = {
	ethereum: { mainnet: 1, sepolia: 11155111 },
	'ethereum-classic': { mainnet: 61, mordor: 63 },
	'binance-smart-chain': { mainnet: 56, testnet: 97 },
	polygon: { mainnet: 137, amoy: 80002 },
	avalanche: { mainnet: 43114, fuji: 43113 },
	arbitrum: { mainnet: 42161, sepolia: 421614 },
	base: { mainnet: 8453, sepolia: 84532 },
	optimism: { mainnet: 10, sepolia: 11155420 },
	tron: { mainnet: 728126428, nile: 201910292 },
};

export function getChainIdForNetwork(blockchain: string, network: string): number {
	const chain = EVM_NETWORK_CHAIN_IDS[blockchain];
	if (!chain) {
		throw new Error(`Unsupported EVM blockchain: ${blockchain}`);
	}
	const chainId = chain[network];
	if (chainId == null) {
		throw new Error(`Unsupported network "${network}" for ${blockchain}`);
	}
	return chainId;
}

/** Display name overrides for blockchains that need special labels */
const BLOCKCHAIN_DISPLAY_NAMES: Record<string, string> = {
	avalanche: 'Avalanche (C-Chain)',
	'binance-smart-chain': 'Binance Smart Chain (BSC)',
};

/** Build n8n options list for blockchain dropdown */
export function blockchainOptions(blockchains: readonly string[]) {
	return blockchains.map((b) => ({
		name: BLOCKCHAIN_DISPLAY_NAMES[b] ?? b
			.split('-')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' '),
		value: b,
	}));
}

/** Build n8n options list for network dropdown */
export function networkOptions(networks: readonly string[]) {
	return networks.map((n) => ({
		name: n.charAt(0).toUpperCase() + n.slice(1),
		value: n,
	}));
}

/** All blockchains valid for broadcast (EVM + UTXO + XRP) */
export const BROADCAST_BLOCKCHAINS = [
	...EVM_BLOCKCHAINS,
	...UTXO_BLOCKCHAINS,
] as const;

/** Blockchain type → valid blockchain names for blockchain events */
export const ALL_BLOCKCHAINS = [
	...EVM_BLOCKCHAINS,
	...UTXO_BLOCKCHAINS,
] as const;

/**
 * Validate that a blockchain-network pair is supported.
 * Throws a user-friendly error if the combination is invalid.
 */
export function validateBlockchainNetwork(blockchain: string, network: string): void {
	const validNetworks = BLOCKCHAIN_NETWORKS[blockchain];
	if (!validNetworks) return; // unknown blockchain — let API handle it
	if (!validNetworks.includes(network)) {
		const formatted = validNetworks.join(', ');
		throw new Error(
			`Network "${network}" is not supported for ${blockchain}. Valid networks: ${formatted}`,
		);
	}
}
