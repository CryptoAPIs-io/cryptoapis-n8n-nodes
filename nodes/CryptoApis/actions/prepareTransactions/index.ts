import type { INodeProperties } from 'n8n-workflow';
import {
	blockchainOptions,
	networkOptions,
	EVM_BLOCKCHAINS,
	EVM_NETWORKS,
} from '../../transport/blockchainConstants';

export const prepareTransactionsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['prepareTransactions'] } },
		options: [
			{ name: 'Prepare Native Coin Transfer', value: 'prepareNativeCoinTransfer', description: 'Build an unsigned native coin transfer transaction', action: 'Build an unsigned native coin transfer (ETH, BNB, etc.)' },
			{ name: 'Prepare Fungible Token Transfer', value: 'prepareFungibleTokenTransfer', description: 'Build an unsigned ERC-20 token transfer', action: 'Build an unsigned ERC-20 token transfer' },
			{ name: 'Prepare NFT Transfer', value: 'prepareNftTransfer', description: 'Build an unsigned ERC-721 NFT transfer', action: 'Build an unsigned ERC-721 NFT transfer' },
		],
		default: 'prepareNativeCoinTransfer',
	},
];

export const prepareTransactionsFields: INodeProperties[] = [
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_BLOCKCHAINS),
		displayOptions: { show: { resource: ['prepareTransactions'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_NETWORKS),
		displayOptions: { show: { resource: ['prepareTransactions'] } },
	},
	{
		displayName: 'From Address',
		name: 'fromAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'Sender address',
		displayOptions: { show: { resource: ['prepareTransactions'] } },
	},
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'Recipient address',
		displayOptions: { show: { resource: ['prepareTransactions'] } },
	},
	// Amount (native)
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '',
		description: 'Amount in the smallest unit (e.g. wei for Ethereum)',
		displayOptions: {
			show: { resource: ['prepareTransactions'], operation: ['prepareNativeCoinTransfer'] },
		},
	},
	// Token transfer fields
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'Token contract address',
		displayOptions: {
			show: { resource: ['prepareTransactions'], operation: ['prepareFungibleTokenTransfer', 'prepareNftTransfer'] },
		},
	},
	{
		displayName: 'Token Amount',
		name: 'tokenAmount',
		type: 'string',
		required: true,
		default: '',
		description: 'Amount of tokens to transfer',
		displayOptions: {
			show: { resource: ['prepareTransactions'], operation: ['prepareFungibleTokenTransfer'] },
		},
	},
	// NFT fields
	{
		displayName: 'Token ID',
		name: 'tokenId',
		type: 'string',
		required: true,
		default: '',
		description: 'NFT token ID to transfer',
		displayOptions: {
			show: { resource: ['prepareTransactions'], operation: ['prepareNftTransfer'] },
		},
	},
	// Fee
	{
		displayName: 'Fee Priority',
		name: 'feePriority',
		type: 'options',
		default: 'standard',
		options: [
			{ name: 'Standard', value: 'standard' },
			{ name: 'Slow', value: 'slow' },
			{ name: 'Fast', value: 'fast' },
		],
		displayOptions: { show: { resource: ['prepareTransactions'] } },
	},
	{
		displayName: 'Gas Limit',
		name: 'gasLimit',
		type: 'string',
		default: '',
		description: 'Optional gas limit override',
		displayOptions: { show: { resource: ['prepareTransactions'] } },
	},
	{
		displayName: 'Gas Price',
		name: 'gasPrice',
		type: 'string',
		default: '',
		description: 'Optional gas price override in wei',
		displayOptions: { show: { resource: ['prepareTransactions'] } },
	},
];
