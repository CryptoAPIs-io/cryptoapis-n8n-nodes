import type { INodeProperties } from 'n8n-workflow';

/**
 * Blockchains supported by AML Screen Transaction — the widest per-endpoint enum in the API.
 * verify-address has no blockchain parameter at all (the address format identifies the chain).
 * Mirrors packages/mcp-aml's AML_SCREENABLE_BLOCKCHAINS in cryptoapis-mcp.
 */
const AML_SCREENABLE_BLOCKCHAINS = [
	'ethereum',
	'ethereum-classic',
	'binance-smart-chain',
	'bitcoin',
	'bitcoin-cash',
	'dash',
	'dogecoin',
	'litecoin',
	'arbitrum',
	'polygon',
	'avalanche',
	'optimism',
	'base',
	'zcash',
	'xrp',
	'solana',
	'tezos',
	'kaspa',
	'tron',
] as const;

/**
 * Blockchains supported by the AML exposure endpoints (Get Address Exposure, List Address
 * Exposure Paths). This is a narrower, distinct enum from AML_SCREENABLE_BLOCKCHAINS above —
 * arbitrum, avalanche, base, optimism, tezos and kaspa have no exposure graph.
 */
const AML_EXPOSURE_BLOCKCHAINS = [
	'ethereum',
	'binance-smart-chain',
	'ethereum-classic',
	'polygon',
	'tron',
	'bitcoin',
	'bitcoin-cash',
	'litecoin',
	'dogecoin',
	'dash',
	'zcash',
	'xrp',
	'solana',
] as const;

export const amlOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['aml'] } },
		options: [
			{ name: 'Verify Address', value: 'verifyAddress', description: 'Check if a blockchain address is flagged for AML risk (fraud, sanctions, ransomware, exploits, darknet markets, etc). Costs 200,000 credits per call — the second-highest cost in the API.', action: 'Check an address for AML risk flags' },
			{ name: 'Screen Transaction', value: 'screenTransaction', description: 'Screen a transaction against AML data, returning flagged participant addresses with their roles/scores/categories. Costs 500,000 credits per call — the highest cost in the entire API.', action: 'Screen a transaction for AML risk' },
			{ name: 'Get Address Exposure', value: 'getAddressExposure', description: 'Get an address\'s exposure to risky entities (sanctions, darknet markets, ransomware, etc). Costs 200,000 credits per request.', action: 'Get an address exposure to risky entities' },
			{ name: 'List Address Exposure Paths', value: 'listAddressExposurePaths', description: 'List the fund-flow paths that connect an address to the risky entities found in its exposure. Costs 100,000 credits per page — paginated manually, no automatic "return all".', action: 'List the fund flow paths behind an address exposure' },
		],
		default: 'verifyAddress',
	},
];

export const amlFields: INodeProperties[] = [
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		description: 'The blockchain address to verify. No blockchain selector needed — the address format identifies the chain.',
		displayOptions: { show: { resource: ['aml'], operation: ['verifyAddress'] } },
	},
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: AML_SCREENABLE_BLOCKCHAINS.map((b) => ({
			name: b
				.split('-')
				.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
				.join(' '),
			value: b,
		})),
		description: 'Blockchain the transaction belongs to (19 chains supported — the widest per-endpoint enum in the API, includes xrp/solana/tezos/kaspa/tron alongside EVM/UTXO)',
		displayOptions: { show: { resource: ['aml'], operation: ['screenTransaction'] } },
	},
	{
		displayName: 'Transaction Hash',
		name: 'transactionHash',
		type: 'string',
		required: true,
		default: '',
		description: 'The transaction hash to screen against AML data',
		displayOptions: { show: { resource: ['aml'], operation: ['screenTransaction'] } },
	},
	{
		displayName: 'Blockchain',
		name: 'exposureBlockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: AML_EXPOSURE_BLOCKCHAINS.map((b) => ({
			name: b
				.split('-')
				.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
				.join(' '),
			value: b,
		})),
		description: 'Blockchain the address belongs to (13 chains supported — narrower than Screen Transaction, as not every chain has an exposure graph)',
		displayOptions: { show: { resource: ['aml'], operation: ['getAddressExposure', 'listAddressExposurePaths'] } },
	},
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		description: 'The blockchain address to check exposure for',
		displayOptions: { show: { resource: ['aml'], operation: ['getAddressExposure', 'listAddressExposurePaths'] } },
	},
	{
		// Named pageLimit, not limit: n8n's lint convention assumes a 'limit' param is always paired
		// with a 'returnAll' toggle and forces default 50 — this is a single page's size with no
		// auto-pagination, and the API's own default is 10.
		displayName: 'Limit',
		name: 'pageLimit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 50 },
		default: 10,
		description: 'Max number of exposure paths to return in this page. Each page costs 100,000 credits — there is no automatic "return all".',
		displayOptions: { show: { resource: ['aml'], operation: ['listAddressExposurePaths'] } },
	},
	{
		displayName: 'Starting After',
		name: 'startingAfter',
		type: 'string',
		default: '',
		description: 'Cursor from a previous page\'s response (nextStartingAfter) to fetch the next page',
		displayOptions: { show: { resource: ['aml'], operation: ['listAddressExposurePaths'] } },
	},
	{
		displayName: 'Root Address',
		name: 'rootAddress',
		type: 'string',
		default: '',
		description: 'Restrict results to paths rooted at this address',
		displayOptions: { show: { resource: ['aml'], operation: ['listAddressExposurePaths'] } },
	},
];
