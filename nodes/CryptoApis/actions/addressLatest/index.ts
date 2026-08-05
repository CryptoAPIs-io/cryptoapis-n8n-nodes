import type { INodeProperties } from 'n8n-workflow';
import {
	blockchainOptions,
	networkOptions,
	EVM_BLOCKCHAINS,
	EVM_NETWORKS,
	UTXO_BLOCKCHAINS,
	UTXO_NETWORKS,
	SOLANA_NETWORKS,
	XRP_NETWORKS,
} from '../../transport/blockchainConstants';
import { EVM_NEXT_NONCE_BLOCKCHAINS, EVM_NEXT_NONCE_NETWORKS } from './blockchainEnums';

export const addressLatestOperations: INodeProperties[] = [
	{
		displayName: 'Blockchain Type',
		name: 'blockchainType',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['addressLatest'] } },
		options: [
			{ name: 'EVM', value: 'evm' },
			{ name: 'Kaspa', value: 'kaspa' },
			{ name: 'Solana', value: 'solana' },
			{ name: 'UTXO', value: 'utxo' },
			{ name: 'XRP', value: 'xrp' },
		],
		default: 'evm',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['addressLatest'] } },
		options: [
			{ name: 'Get Balance', value: 'getBalance', description: 'Get current balance of an address (all blockchain types)', action: 'Get current balance of an address' },
			{ name: 'Get Next Nonce', value: 'getNextNonce', description: 'Get next available nonce for an EVM address (EVM only)', action: 'Get next available nonce for an EVM address' },
			{ name: 'List Internal Transactions', value: 'listInternalTransactions', description: 'List recent internal transactions for an EVM address (EVM only)', action: 'List recent internal transactions for an address' },
			{ name: 'List Token Transfers', value: 'listTokenTransfers', description: 'List recent token transfers for an EVM address (EVM only)', action: 'List recent token transfers for an address' },
			{ name: 'List Tokens', value: 'listTokens', description: 'List tokens held by a Solana address (Solana only)', action: 'List tokens held by a solana address' },
			{ name: 'List Transactions', value: 'listTransactions', description: 'List recent transactions for an address — last 14 days (all blockchain types)', action: 'List recent transactions for an address' },
		],
		default: 'getBalance',
	},
];

export const addressLatestFields: INodeProperties[] = [
	// Blockchain/Network (EVM) — getNextNonce supports only 3 of the 9 EVM chains per the spec,
	// so it gets its own narrower dropdown; every other EVM operation here genuinely supports all 9.
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_BLOCKCHAINS),
		displayOptions: { show: { resource: ['addressLatest'], blockchainType: ['evm'], operation: ['getBalance', 'listTransactions', 'listTokenTransfers', 'listInternalTransactions'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_NETWORKS),
		displayOptions: { show: { resource: ['addressLatest'], blockchainType: ['evm'], operation: ['getBalance', 'listTransactions', 'listTokenTransfers', 'listInternalTransactions'] } },
	},
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_NEXT_NONCE_BLOCKCHAINS),
		displayOptions: { show: { resource: ['addressLatest'], blockchainType: ['evm'], operation: ['getNextNonce'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_NEXT_NONCE_NETWORKS),
		displayOptions: { show: { resource: ['addressLatest'], blockchainType: ['evm'], operation: ['getNextNonce'] } },
	},
	// Blockchain (UTXO)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(UTXO_BLOCKCHAINS),
		displayOptions: { show: { resource: ['addressLatest'], blockchainType: ['utxo'] } },
	},
	// Network (UTXO)
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(UTXO_NETWORKS),
		displayOptions: { show: { resource: ['addressLatest'], blockchainType: ['utxo'] } },
	},
	// Network (Solana)
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(SOLANA_NETWORKS),
		displayOptions: { show: { resource: ['addressLatest'], blockchainType: ['solana'] } },
	},
	// Network (XRP)
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(XRP_NETWORKS),
		displayOptions: { show: { resource: ['addressLatest'], blockchainType: ['xrp'] } },
	},
	// Network (Kaspa) — mainnet only; was missing entirely, so the path never included a network segment.
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: [{ name: 'Mainnet', value: 'mainnet' }],
		displayOptions: { show: { resource: ['addressLatest'], blockchainType: ['kaspa'] } },
	},
	// Address (all types)
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		description: 'The blockchain address to query',
		displayOptions: { show: { resource: ['addressLatest'] } },
	},
	// Pagination: Return All
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['addressLatest'],
				operation: ['listTransactions', 'listTokenTransfers', 'listInternalTransactions', 'listTokens'],
			},
		},
	},
	// Pagination: Limit
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 200 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				resource: ['addressLatest'],
				operation: ['listTransactions', 'listTokenTransfers', 'listInternalTransactions', 'listTokens'],
				returnAll: [false],
			},
		},
	},
];
