import type { INodeProperties } from 'n8n-workflow';
import {
	blockchainOptions,
	networkOptions,
	SOLANA_NETWORKS,
	XRP_NETWORKS,
} from '../../transport/blockchainConstants';
import {
	EVM_DETAILS_BLOCKCHAINS,
	EVM_DETAILS_NETWORKS,
	EVM_INTERNAL_BLOCKCHAINS,
	EVM_INTERNAL_NETWORKS,
	EVM_LOGS_BLOCKCHAINS,
	EVM_LOGS_NETWORKS,
	EVM_TOKENS_TRANSFERS_BLOCKCHAINS,
	EVM_TOKENS_TRANSFERS_NETWORKS,
	UTXO_DETAILS_BLOCKCHAINS,
	UTXO_DETAILS_NETWORKS,
	UTXO_RAW_DATA_BLOCKCHAINS,
	UTXO_RAW_DATA_NETWORKS,
} from './blockchainEnums';

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
		// Operation availability genuinely differs per blockchain type per the spec: UTXO only has
		// getTransactionDetails/getRawTransactionData, XRP/Solana/Kaspa only have getTransactionDetails.
		displayOptions: { show: { resource: ['transactionsData'] } },
		options: [
			{ name: 'Get Transaction Details', value: 'getTransactionDetails', description: 'Get detailed information about a specific transaction (all blockchain types)', action: 'Get details of a specific transaction' },
			{ name: 'List Internal Transactions', value: 'listInternalTransactions', description: 'List internal transactions of an EVM transaction (EVM only)', action: 'List internal transactions of a transaction' },
			{ name: 'List Token Transfers', value: 'listTokenTransfers', description: 'List token transfers of an EVM transaction (EVM only)', action: 'List token transfers of a transaction' },
			{ name: 'List Logs', value: 'listLogs', description: 'List event logs of an EVM Ethereum transaction (Ethereum only, not other EVM chains)', action: 'List event logs of a transaction' },
			{ name: 'Get Raw Transaction Data', value: 'getRawTransactionData', description: 'Get raw hex of a UTXO transaction (UTXO only, not bitcoin-cash-zcash-only either -- excludes zcash)', action: 'Get raw hex of a UTXO transaction' },
		],
		default: 'getTransactionDetails',
	},
];

export const transactionsDataFields: INodeProperties[] = [
	// Blockchain/Network (EVM) — per-operation enums, since support genuinely differs
	// (e.g. listLogs is ethereum-only while the other 3 EVM operations support all 9 chains).
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_DETAILS_BLOCKCHAINS),
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['evm'], operation: ['getTransactionDetails'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_DETAILS_NETWORKS),
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['evm'], operation: ['getTransactionDetails'] } },
	},
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_INTERNAL_BLOCKCHAINS),
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['evm'], operation: ['listInternalTransactions'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_INTERNAL_NETWORKS),
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['evm'], operation: ['listInternalTransactions'] } },
	},
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_TOKENS_TRANSFERS_BLOCKCHAINS),
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['evm'], operation: ['listTokenTransfers'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_TOKENS_TRANSFERS_NETWORKS),
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['evm'], operation: ['listTokenTransfers'] } },
	},
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_LOGS_BLOCKCHAINS),
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['evm'], operation: ['listLogs'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_LOGS_NETWORKS),
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['evm'], operation: ['listLogs'] } },
	},
	// Blockchain/Network (UTXO)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(UTXO_DETAILS_BLOCKCHAINS),
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['utxo'], operation: ['getTransactionDetails'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(UTXO_DETAILS_NETWORKS),
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['utxo'], operation: ['getTransactionDetails'] } },
	},
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(UTXO_RAW_DATA_BLOCKCHAINS),
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['utxo'], operation: ['getRawTransactionData'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(UTXO_RAW_DATA_NETWORKS),
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['utxo'], operation: ['getRawTransactionData'] } },
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
	// Network (Kaspa) — mainnet only; was missing entirely, so the path never included a network segment.
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: [{ name: 'Mainnet', value: 'mainnet' }],
		displayOptions: { show: { resource: ['transactionsData'], blockchainType: ['kaspa'] } },
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
