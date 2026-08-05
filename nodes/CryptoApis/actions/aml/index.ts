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
];
