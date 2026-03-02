import type { INodeProperties } from 'n8n-workflow';
import {
	blockchainOptions,
	networkOptions,
	EVM_BLOCKCHAINS,
	EVM_NETWORKS,
	UTXO_BLOCKCHAINS,
	UTXO_NETWORKS,
	XRP_NETWORKS,
} from '../../transport/blockchainConstants';

export const blockDataOperations: INodeProperties[] = [
	{
		displayName: 'Blockchain Type',
		name: 'blockchainType',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['blockData'] } },
		options: [
			{ name: 'EVM', value: 'evm' },
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
		displayOptions: { show: { resource: ['blockData'] } },
		options: [
			{ name: 'Get Block by Height', value: 'getBlockByHeight', description: 'Get block details by block height', action: 'Get block details using its height number' },
			{ name: 'Get Block by Hash', value: 'getBlockByHash', description: 'Get block details by block hash', action: 'Get block details using its hash' },
			{ name: 'List Transactions by Block Hash', value: 'listTransactionsByBlockHash', description: 'List transactions within a specific block by hash', action: 'List all transactions in a block by hash' },
			{ name: 'List Transactions by Block Height', value: 'listTransactionsByBlockHeight', description: 'List transactions within a specific block by height', action: 'List all transactions in a block by height' },
			{ name: 'Get Last Mined Block', value: 'getLastMinedBlock', description: 'Get the latest mined block', action: 'Get the most recently mined block' },
			{ name: 'List Latest Mined Blocks', value: 'listLatestMinedBlocks', description: 'List the most recently mined blocks', action: 'List the most recently mined blocks' },
		],
		default: 'getBlockByHeight',
	},
];

export const blockDataFields: INodeProperties[] = [
	// Blockchain (EVM)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_BLOCKCHAINS),
		displayOptions: { show: { resource: ['blockData'], blockchainType: ['evm'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_NETWORKS),
		displayOptions: { show: { resource: ['blockData'], blockchainType: ['evm'] } },
	},
	// Blockchain (UTXO)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(UTXO_BLOCKCHAINS),
		displayOptions: { show: { resource: ['blockData'], blockchainType: ['utxo'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(UTXO_NETWORKS),
		displayOptions: { show: { resource: ['blockData'], blockchainType: ['utxo'] } },
	},
	// Network (XRP)
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(XRP_NETWORKS),
		displayOptions: { show: { resource: ['blockData'], blockchainType: ['xrp'] } },
	},
	// Block Height
	{
		displayName: 'Block Height',
		name: 'blockHeight',
		type: 'string',
		required: true,
		default: '',
		description: 'The height (number) of the block',
		displayOptions: {
			show: {
				resource: ['blockData'],
				operation: ['getBlockByHeight', 'listTransactionsByBlockHeight'],
			},
		},
	},
	// Block Hash
	{
		displayName: 'Block Hash',
		name: 'blockHash',
		type: 'string',
		required: true,
		default: '',
		description: 'The hash of the block',
		displayOptions: {
			show: {
				resource: ['blockData'],
				operation: ['getBlockByHash', 'listTransactionsByBlockHash'],
			},
		},
	},
	// Count (for list latest)
	{
		displayName: 'Count',
		name: 'count',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 10,
		description: 'Number of latest blocks to return (max 100)',
		displayOptions: {
			show: {
				resource: ['blockData'],
				operation: ['listLatestMinedBlocks'],
			},
		},
	},
	// Return All (for list transactions)
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['blockData'],
				operation: ['listTransactionsByBlockHash', 'listTransactionsByBlockHeight'],
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
				resource: ['blockData'],
				operation: ['listTransactionsByBlockHash', 'listTransactionsByBlockHeight'],
				returnAll: [false],
			},
		},
	},
];
