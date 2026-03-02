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

export const addressLatestOperations: INodeProperties[] = [
	{
		displayName: 'Blockchain Type',
		name: 'blockchainType',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['addressLatest'] } },
		options: [
			{ name: 'EVM', value: 'evm' },
			{ name: 'UTXO', value: 'utxo' },
			{ name: 'Solana', value: 'solana' },
			{ name: 'XRP', value: 'xrp' },
			{ name: 'Kaspa', value: 'kaspa' },
		],
		default: 'evm',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['addressLatest'], blockchainType: ['evm'] },
		},
		options: [
			{ name: 'Get Balance', value: 'getBalance', description: 'Get current balance of an EVM address', action: 'Get balance' },
			{ name: 'Get Next Nonce', value: 'getNextNonce', description: 'Get next available nonce for an EVM address', action: 'Get next nonce' },
			{ name: 'List Transactions', value: 'listTransactions', description: 'List recent transactions for an EVM address (last 14 days)', action: 'List transactions' },
			{ name: 'List Token Transfers', value: 'listTokenTransfers', description: 'List recent token transfers for an EVM address', action: 'List token transfers' },
			{ name: 'List Internal Transactions', value: 'listInternalTransactions', description: 'List recent internal transactions for an EVM address', action: 'List internal transactions' },
		],
		default: 'getBalance',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['addressLatest'], blockchainType: ['utxo'] },
		},
		options: [
			{ name: 'Get Balance', value: 'getBalance', description: 'Get current balance of a UTXO address', action: 'Get balance' },
			{ name: 'List Transactions', value: 'listTransactions', description: 'List recent transactions for a UTXO address', action: 'List transactions' },
		],
		default: 'getBalance',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['addressLatest'], blockchainType: ['solana'] },
		},
		options: [
			{ name: 'Get Balance', value: 'getBalance', description: 'Get current balance of a Solana address', action: 'Get balance' },
			{ name: 'List Transactions', value: 'listTransactions', description: 'List recent transactions for a Solana address', action: 'List transactions' },
			{ name: 'List Tokens', value: 'listTokens', description: 'List tokens held by a Solana address', action: 'List tokens' },
		],
		default: 'getBalance',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['addressLatest'], blockchainType: ['xrp'] },
		},
		options: [
			{ name: 'Get Balance', value: 'getBalance', description: 'Get current balance of an XRP address', action: 'Get balance' },
			{ name: 'List Transactions', value: 'listTransactions', description: 'List recent transactions for an XRP address', action: 'List transactions' },
		],
		default: 'getBalance',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['addressLatest'], blockchainType: ['kaspa'] },
		},
		options: [
			{ name: 'Get Balance', value: 'getBalance', description: 'Get current balance of a Kaspa address', action: 'Get balance' },
			{ name: 'List Transactions', value: 'listTransactions', description: 'List recent transactions for a Kaspa address', action: 'List transactions' },
		],
		default: 'getBalance',
	},
];

export const addressLatestFields: INodeProperties[] = [
	// Blockchain (EVM)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_BLOCKCHAINS),
		displayOptions: { show: { resource: ['addressLatest'], blockchainType: ['evm'] } },
	},
	// Network (EVM)
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_NETWORKS),
		displayOptions: { show: { resource: ['addressLatest'], blockchainType: ['evm'] } },
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
