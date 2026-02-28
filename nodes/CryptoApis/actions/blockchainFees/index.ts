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

export const blockchainFeesOperations: INodeProperties[] = [
	{
		displayName: 'Blockchain Type',
		name: 'blockchainType',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['blockchainFees'] } },
		options: [
			{ name: 'EVM', value: 'evm' },
			{ name: 'UTXO', value: 'utxo' },
			{ name: 'XRP', value: 'xrp' },
		],
		default: 'evm',
	},
	// EVM operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'] } },
		options: [
			{ name: 'Get Fee Recommendations', value: 'getFeeRecommendations', description: 'Get mempool fee recommendations', action: 'Get fee recommendations' },
			{ name: 'Get EIP-1559 Fee Recommendations', value: 'getEip1559FeeRecommendations', description: 'Get EIP-1559 fee recommendations (base fee + priority fee)', action: 'Get EIP-1559 fee recommendations' },
			{ name: 'Estimate Native Coin Transfer Gas', value: 'estimateNativeCoinTransferGas', description: 'Estimate gas for a native coin transfer', action: 'Estimate native coin transfer gas' },
			{ name: 'Estimate Token Transfer Gas', value: 'estimateTokenTransferGas', description: 'Estimate gas for a token transfer (ERC-20/ERC-721)', action: 'Estimate token transfer gas' },
			{ name: 'Estimate Contract Interaction Gas', value: 'estimateContractInteractionGas', description: 'Estimate gas for a contract interaction using calldata', action: 'Estimate contract interaction gas' },
		],
		default: 'getFeeRecommendations',
	},
	// UTXO operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['utxo'] } },
		options: [
			{ name: 'Get Fee Recommendations', value: 'getFeeRecommendations', description: 'Get mempool fee recommendations', action: 'Get fee recommendations' },
			{ name: 'Estimate Transaction Smart Fee', value: 'estimateTransactionSmartFee', description: 'Estimate smart fee for a UTXO transaction with confirmation target', action: 'Estimate transaction smart fee' },
		],
		default: 'getFeeRecommendations',
	},
	// XRP operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['xrp'] } },
		options: [
			{ name: 'Get Fee Recommendations', value: 'getFeeRecommendations', description: 'Get mempool fee recommendations for XRP', action: 'Get fee recommendations' },
		],
		default: 'getFeeRecommendations',
	},
];

export const blockchainFeesFields: INodeProperties[] = [
	// Blockchain (EVM)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_BLOCKCHAINS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'] } },
	},
	// Blockchain (UTXO)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(UTXO_BLOCKCHAINS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['utxo'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(UTXO_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['utxo'] } },
	},
	// Network (XRP)
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(XRP_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['xrp'] } },
	},

	// --- EVM Estimate Gas fields ---
	{
		displayName: 'From Address',
		name: 'fromAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'Sender address',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateNativeCoinTransferGas', 'estimateTokenTransferGas', 'estimateContractInteractionGas'],
			},
		},
	},
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'Recipient address',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateNativeCoinTransferGas'],
			},
		},
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '',
		description: 'Amount to transfer (in native coin smallest unit, e.g. wei)',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateNativeCoinTransferGas'],
			},
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
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateTokenTransferGas', 'estimateContractInteractionGas'],
			},
		},
	},
	{
		displayName: 'Contract Type',
		name: 'contractType',
		type: 'options',
		required: true,
		default: 'ERC-20',
		options: [
			{ name: 'ERC-20', value: 'ERC-20' },
			{ name: 'ERC-721', value: 'ERC-721' },
		],
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateTokenTransferGas'],
			},
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
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateTokenTransferGas'],
			},
		},
	},
	// Contract interaction fields
	{
		displayName: 'Calldata',
		name: 'data',
		type: 'string',
		required: true,
		default: '',
		description: 'Hex-encoded calldata for the contract interaction',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateContractInteractionGas'],
			},
		},
	},

	// --- UTXO Smart Fee fields ---
	{
		displayName: 'Confirmation Target',
		name: 'confirmationTarget',
		type: 'number',
		typeOptions: { minValue: 1 },
		required: true,
		default: 2,
		description: 'Number of blocks within which the transaction should be confirmed',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateTransactionSmartFee'],
			},
		},
	},
	{
		displayName: 'Fee Rate Priority',
		name: 'feeRatePriority',
		type: 'options',
		default: 'ECONOMICAL',
		options: [
			{ name: 'Economical', value: 'ECONOMICAL' },
			{ name: 'Conservative', value: 'CONSERVATIVE' },
		],
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateTransactionSmartFee'],
			},
		},
	},
];
