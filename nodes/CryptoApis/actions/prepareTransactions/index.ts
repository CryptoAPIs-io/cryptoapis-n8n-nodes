import type { INodeProperties } from 'n8n-workflow';
import {
	blockchainOptions,
	networkOptions,
	EVM_BLOCKCHAINS,
	EVM_NETWORKS,
	TEZOS_NETWORKS,
} from '../../transport/blockchainConstants';

export const prepareTransactionsOperations: INodeProperties[] = [
	{
		displayName: 'Blockchain Type',
		name: 'blockchainType',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['prepareTransactions'] } },
		options: [
			{ name: 'EVM', value: 'evm' },
			{ name: 'Tezos', value: 'tezos' },
		],
		// Defaults to evm so existing workflows, which predate this selector and never
		// set it, keep resolving to the EVM paths they already used.
		default: 'evm',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['prepareTransactions'], blockchainType: ['evm'] } },
		options: [
			{ name: 'Prepare Native Coin Transfer', value: 'prepareNativeCoinTransfer', description: 'Build an unsigned native coin transfer transaction', action: 'Build an unsigned native coin transfer (ETH, BNB, etc.)' },
			{ name: 'Prepare Fungible Token Transfer', value: 'prepareFungibleTokenTransfer', description: 'Build an unsigned ERC-20 token transfer', action: 'Build an unsigned ERC-20 token transfer' },
			{ name: 'Prepare NFT Transfer', value: 'prepareNftTransfer', description: 'Build an unsigned ERC-721 NFT transfer', action: 'Build an unsigned ERC-721 NFT transfer' },
		],
		default: 'prepareNativeCoinTransfer',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['prepareTransactions'], blockchainType: ['tezos'] } },
		options: [
			{ name: 'Prepare Native Coin Transfer', value: 'prepareTezosNativeCoinTransfer', description: 'Build an unsigned XTZ transfer transaction', action: 'Build an unsigned XTZ transfer' },
			{ name: 'Prepare FA1.2 Token Transfer', value: 'prepareFa12TokenTransfer', description: 'Build an unsigned FA1.2 token transfer', action: 'Build an unsigned FA1.2 token transfer' },
			{ name: 'Prepare FA2 Token Transfer', value: 'prepareFa2TokenTransfer', description: 'Build an unsigned FA2 token transfer', action: 'Build an unsigned FA2 token transfer' },
		],
		default: 'prepareTezosNativeCoinTransfer',
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
		displayOptions: { show: { resource: ['prepareTransactions'], blockchainType: ['evm'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_NETWORKS),
		displayOptions: { show: { resource: ['prepareTransactions'], blockchainType: ['evm'] } },
	},
	{
		displayName: 'From Address',
		name: 'fromAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'Sender address',
		displayOptions: { show: { resource: ['prepareTransactions'], blockchainType: ['evm'] } },
	},
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'Recipient address',
		displayOptions: { show: { resource: ['prepareTransactions'], blockchainType: ['evm'] } },
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
			show: { resource: ['prepareTransactions'], blockchainType: ['evm'], operation: ['prepareNativeCoinTransfer'] },
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
			show: { resource: ['prepareTransactions'], blockchainType: ['evm'], operation: ['prepareFungibleTokenTransfer', 'prepareNftTransfer'] },
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
			show: { resource: ['prepareTransactions'], blockchainType: ['evm'], operation: ['prepareFungibleTokenTransfer'] },
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
			show: { resource: ['prepareTransactions'], blockchainType: ['evm'], operation: ['prepareNftTransfer'] },
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
		displayOptions: { show: { resource: ['prepareTransactions'], blockchainType: ['evm'] } },
	},
	{
		displayName: 'Gas Limit',
		name: 'gasLimit',
		type: 'string',
		default: '',
		description: 'Optional gas limit override',
		displayOptions: { show: { resource: ['prepareTransactions'], blockchainType: ['evm'] } },
	},
	{
		displayName: 'Gas Price',
		name: 'gasPrice',
		type: 'string',
		default: '',
		description: 'Optional gas price override in wei',
		displayOptions: { show: { resource: ['prepareTransactions'], blockchainType: ['evm'] } },
	},

	// --- Tezos ---
	// The path is /prepare-transactions/tezos/{network}/... — no blockchain segment,
	// so blockchainType IS the chain. Tezos uses FA1.2/FA2 token standards rather than
	// ERC-20/721, so these operations need their own fields, not the EVM ones.
	{
		displayName: 'Network',
		name: 'tezosNetwork',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(TEZOS_NETWORKS),
		displayOptions: { show: { resource: ['prepareTransactions'], blockchainType: ['tezos'] } },
	},
	{
		displayName: 'From Address',
		name: 'tezosFromAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'Sender address (tz1…/tz2…/tz3…)',
		displayOptions: { show: { resource: ['prepareTransactions'], blockchainType: ['tezos'] } },
	},
	{
		displayName: 'To Address',
		name: 'tezosToAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'Recipient address',
		displayOptions: { show: { resource: ['prepareTransactions'], blockchainType: ['tezos'] } },
	},
	{
		displayName: 'Amount',
		name: 'tezosPrepareAmount',
		type: 'string',
		required: true,
		default: '',
		description: 'Amount to transfer, as a decimal string',
		displayOptions: { show: { resource: ['prepareTransactions'], blockchainType: ['tezos'] } },
	},
	{
		displayName: 'Contract Address',
		name: 'tezosPrepareContractAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'The FA1.2/FA2 token contract address (KT1…)',
		displayOptions: {
			show: {
				resource: ['prepareTransactions'],
				blockchainType: ['tezos'],
				operation: ['prepareFa12TokenTransfer', 'prepareFa2TokenTransfer'],
			},
		},
	},
	{
		displayName: 'Token ID',
		name: 'tezosPrepareTokenId',
		type: 'string',
		required: true,
		default: '',
		description: 'The FA2 token ID within the contract. FA2 contracts can hold many token IDs; FA1.2 cannot, which is why this is FA2-only.',
		displayOptions: {
			show: {
				resource: ['prepareTransactions'],
				blockchainType: ['tezos'],
				operation: ['prepareFa2TokenTransfer'],
			},
		},
	},
	{
		displayName: 'From Public Key',
		name: 'tezosFromPublicKey',
		type: 'string',
		default: '',
		description: 'Only needed when the sender account is not yet revealed on-chain — the prepared transaction then includes the reveal operation',
		displayOptions: { show: { resource: ['prepareTransactions'], blockchainType: ['tezos'] } },
	},
	{
		displayName: 'Fee Priority',
		name: 'tezosFeePriority',
		type: 'options',
		default: 'standard',
		options: [
			{ name: 'Standard', value: 'standard' },
			{ name: 'Slow', value: 'slow' },
			{ name: 'Fast', value: 'fast' },
		],
		displayOptions: { show: { resource: ['prepareTransactions'], blockchainType: ['tezos'] } },
	},
];
