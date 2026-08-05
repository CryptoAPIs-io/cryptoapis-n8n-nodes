import type { INodeProperties } from 'n8n-workflow';
import { blockchainOptions, networkOptions, XRP_NETWORKS, TEZOS_NETWORKS } from '../../transport/blockchainConstants';
import {
	EVM_MEMPOOL_BLOCKCHAINS,
	EVM_MEMPOOL_NETWORKS,
	EVM_EIP1559_BLOCKCHAINS,
	EVM_EIP1559_NETWORKS,
	EVM_NATIVE_COIN_GAS_BLOCKCHAINS,
	EVM_NATIVE_COIN_GAS_NETWORKS,
	EVM_TOKEN_GAS_BLOCKCHAINS,
	EVM_TOKEN_GAS_NETWORKS,
	EVM_CONTRACT_GAS_BLOCKCHAINS,
	EVM_CONTRACT_GAS_NETWORKS,
	UTXO_MEMPOOL_BLOCKCHAINS,
	UTXO_MEMPOOL_NETWORKS,
	UTXO_SMART_FEE_BLOCKCHAINS,
	UTXO_SMART_FEE_NETWORKS,
} from './blockchainEnums';

export const blockchainFeesOperations: INodeProperties[] = [
	{
		displayName: 'Blockchain Type',
		name: 'blockchainType',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['blockchainFees'] } },
		options: [
			{ name: 'EVM', value: 'evm' },
			{ name: 'Tezos', value: 'tezos' },
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
		displayOptions: { show: { resource: ['blockchainFees'] } },
		options: [
			{ name: 'Get Fee Recommendations', value: 'getFeeRecommendations', description: 'Get mempool fee recommendations (all blockchain types)', action: 'Get mempool fee recommendations' },
			{ name: 'Get EIP-1559 Fee Recommendations', value: 'getEip1559FeeRecommendations', description: 'Get EIP-1559 fee recommendations — base fee + priority fee (EVM only)', action: 'Get EIP-1559 fee recommendations (base + priority fee)' },
			{ name: 'Estimate Native Coin Transfer Gas', value: 'estimateNativeCoinTransferGas', description: 'Estimate gas for a native coin transfer (EVM only)', action: 'Estimate gas for a native coin transfer' },
			{ name: 'Estimate Token Transfer Gas', value: 'estimateTokenTransferGas', description: 'Estimate gas for a token transfer — ERC-20/ERC-721 (EVM only)', action: 'Estimate gas for a token transfer (ERC-20/ERC-721)' },
			{ name: 'Estimate Contract Interaction Gas', value: 'estimateContractInteractionGas', description: 'Estimate gas for a contract interaction using calldata (EVM only)', action: 'Estimate gas for a contract interaction' },
			{ name: 'Estimate Transaction Smart Fee', value: 'estimateTransactionSmartFee', description: 'Estimate smart fee for a UTXO transaction with confirmation target (UTXO only)', action: 'Estimate smart fee for a UTXO transaction' },
			{ name: 'Estimate Transfer Fee', value: 'estimateTransferFee', description: 'Estimate the fee for a native XTZ transfer (Tezos only)', action: 'Estimate the fee for a native XTZ transfer' },
			{ name: 'Estimate FA1.2 Transfer Fee', value: 'estimateFa12TransferFee', description: 'Estimate the fee for an FA1.2 token transfer (Tezos only)', action: 'Estimate the fee for an FA1.2 token transfer' },
			{ name: 'Estimate FA2 Transfer Fee', value: 'estimateFa2TransferFee', description: 'Estimate the fee for an FA2 token transfer (Tezos only)', action: 'Estimate the fee for an FA2 token transfer' },
		],
		default: 'getFeeRecommendations',
	},
];

export const blockchainFeesFields: INodeProperties[] = [
	// Blockchain/Network (EVM) — per-operation enums, since support genuinely differs:
	// contract-interaction gas EXCLUDES ethereum/ethereum-classic/binance-smart-chain entirely,
	// eip-1559 only exists for 5 of 9 chains, mempool excludes tron (dedicated path).
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_MEMPOOL_BLOCKCHAINS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['getFeeRecommendations'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_MEMPOOL_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['getFeeRecommendations'] } },
	},
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_EIP1559_BLOCKCHAINS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['getEip1559FeeRecommendations'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_EIP1559_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['getEip1559FeeRecommendations'] } },
	},
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_NATIVE_COIN_GAS_BLOCKCHAINS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['estimateNativeCoinTransferGas'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_NATIVE_COIN_GAS_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['estimateNativeCoinTransferGas'] } },
	},
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_TOKEN_GAS_BLOCKCHAINS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['estimateTokenTransferGas'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_TOKEN_GAS_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['estimateTokenTransferGas'] } },
	},
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'arbitrum',
		options: blockchainOptions(EVM_CONTRACT_GAS_BLOCKCHAINS),
		description: 'ethereum, ethereum-classic, and binance-smart-chain do not support this endpoint per the spec',
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['estimateContractInteractionGas'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_CONTRACT_GAS_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['estimateContractInteractionGas'] } },
	},
	// Blockchain/Network (UTXO)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(UTXO_MEMPOOL_BLOCKCHAINS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['utxo'], operation: ['getFeeRecommendations'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(UTXO_MEMPOOL_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['utxo'], operation: ['getFeeRecommendations'] } },
	},
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(UTXO_SMART_FEE_BLOCKCHAINS),
		description: 'bitcoin-cash, dogecoin, and zcash do not support this endpoint per the spec',
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['utxo'], operation: ['estimateTransactionSmartFee'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(UTXO_SMART_FEE_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['utxo'], operation: ['estimateTransactionSmartFee'] } },
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

	// Network (Tezos) — like XRP, the path carries no separate blockchain segment
	// (/blockchain-fees/tezos/{network}/...), so blockchainType IS the chain.
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(TEZOS_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['tezos'] } },
	},

	// --- Tezos fee-estimate fields ---
	// Shared by all three estimate operations. `senderPublicKey` is optional: the API
	// needs it only when the sender account is still unrevealed on-chain, in which case
	// the reveal operation's cost is included in the estimate.
	{
		displayName: 'Sender',
		name: 'tezosSender',
		type: 'string',
		required: true,
		default: '',
		description: 'The address sending the funds',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['tezos'],
				operation: ['estimateTransferFee', 'estimateFa12TransferFee', 'estimateFa2TransferFee'],
			},
		},
	},
	{
		displayName: 'Recipient',
		name: 'tezosRecipient',
		type: 'string',
		required: true,
		default: '',
		description: 'The address receiving the funds',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['tezos'],
				operation: ['estimateTransferFee', 'estimateFa12TransferFee', 'estimateFa2TransferFee'],
			},
		},
	},
	{
		displayName: 'Amount',
		name: 'tezosAmount',
		type: 'string',
		required: true,
		default: '',
		description: 'Amount to transfer, as a decimal string',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['tezos'],
				operation: ['estimateTransferFee', 'estimateFa12TransferFee', 'estimateFa2TransferFee'],
			},
		},
	},
	{
		displayName: 'Contract Address',
		name: 'tezosContractAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'The FA1.2/FA2 token contract address (KT1…)',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['tezos'],
				operation: ['estimateFa12TransferFee', 'estimateFa2TransferFee'],
			},
		},
	},
	{
		displayName: 'Token ID',
		name: 'tezosTokenId',
		type: 'string',
		required: true,
		default: '0',
		// String, not number: the API rejects a numeric tokenId with
		// invalid_data "Required value type is string" (verified live).
		description: 'The FA2 token ID within the contract. FA2 contracts can hold many token IDs; FA1.2 cannot, which is why this is FA2-only.',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['tezos'],
				operation: ['estimateFa2TransferFee'],
			},
		},
	},
	{
		displayName: 'Sender Public Key',
		name: 'tezosSenderPublicKey',
		type: 'string',
		default: '',
		description: 'Only needed when the sender account is not yet revealed on-chain — the estimate then includes the reveal cost',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['tezos'],
				operation: ['estimateTransferFee', 'estimateFa12TransferFee', 'estimateFa2TransferFee'],
			},
		},
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
				operation: ['estimateNativeCoinTransferGas', 'estimateTokenTransferGas'],
			},
		},
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '',
		description: 'Amount to transfer (in native coin smallest unit, e.g. wei). For contract interaction, this is the native coin value sent with the call, e.g. "0".',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateNativeCoinTransferGas', 'estimateContractInteractionGas'],
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
