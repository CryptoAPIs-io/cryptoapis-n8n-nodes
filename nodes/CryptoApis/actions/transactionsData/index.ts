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

export const transactionsDataOperations: INodeProperties[] = [
	{
		displayName: 'Blockchain Type',
		name: 'blockchainType',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['transactionsData'] } },
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
		displayOptions: { show: { resource: ['transactionsData'] } },
		options: [
			{ name: 'Get Transaction Details', value: 'getTransactionDetails', description: 'Get detailed information about a specific transaction (all blockchain types)', action: 'Get details of a specific transaction' },
			{ name: 'List Internal Transactions', value: 'listInternalTransactions', description: 'List internal transactions of an EVM transaction (EVM only)', action: 'List internal transactions of a transaction' },
			{ name: 'List Token Transfers', value: 'listTokenTransfers', description: 'List token transfers of an EVM transaction (EVM only)', action: 'List token transfers of a transaction' },
			{ name: 'List Logs', value: 'listLogs', description: 'List event logs of an EVM transaction (EVM only)', action: 'List event logs of a transaction' },
			{ name: 'Get Raw Transaction Data', value: 'getRawTransactionData', description: 'Get raw hex of a UTXO transaction (UTXO only)', action: 'Get raw hex of a UTXO transaction' },
		],
		default: 'getTransactionDetails',
	},
];

export const transactionsDataFields: INodeProperties[] = [
	// Blockchain (EVM)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_BLOCKCHAINS),
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['evm'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_NETWORKS),
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['evm'] } },
	},
	// Blockchain (UTXO)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(UTXO_BLOCKCHAINS),
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['utxo'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(UTXO_NETWORKS),
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['utxo'] } },
	},
	// Network (Solana)
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(SOLANA_NETWORKS),
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['solana'] } },
	},
	// Network (XRP)
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(XRP_NETWORKS),
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['xrp'] } },
	},
	// Transaction Hash
	{
		displayName: 'Transaction Hash',
		name: 'transactionHash',
		type: 'string',
		required: true,
		default: '',
		description: 'The hash/ID of the transaction',
		displayOptions: { show: { resource: ['transactionsData'] } },
	},
	// Pagination for list operations
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['transactionsData'],
				operation: ['listInternalTransactions', 'listTokenTransfers', 'listLogs'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 200 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				resource: ['transactionsData'],
				operation: ['listInternalTransactions', 'listTokenTransfers', 'listLogs'],
				returnAll: [false],
			},
		},
	},
];
