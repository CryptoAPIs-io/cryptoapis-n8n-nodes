import type { INodeProperties } from 'n8n-workflow';
import {
	blockchainOptions,
	networkOptions,
	EVM_BLOCKCHAINS,
	EVM_NETWORKS,
	UTXO_BLOCKCHAINS,
	UTXO_NETWORKS,
	XRP_NETWORKS,
	SOLANA_NETWORKS,
} from '../../transport/blockchainConstants';

/** Tezos is broadcast-capable per the spec (unlike Kaspa, which has no broadcast endpoint at all). */
const TEZOS_NETWORKS = ['mainnet', 'shadownet'] as const;

export const broadcastOperations: INodeProperties[] = [
	{
		displayName: 'Blockchain Type',
		name: 'blockchainType',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['broadcast'] } },
		options: [
			{ name: 'EVM', value: 'evm' },
			{ name: 'UTXO', value: 'utxo' },
			{ name: 'XRP', value: 'xrp' },
			{ name: 'Solana', value: 'solana' },
			{ name: 'Tezos', value: 'tezos' },
		],
		default: 'evm',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['broadcast'] } },
		options: [
			{ name: 'Broadcast Signed Transaction', value: 'broadcastSignedTransaction', description: 'Broadcast a signed transaction to the blockchain network', action: 'Broadcast a signed transaction to the network' },
		],
		default: 'broadcastSignedTransaction',
	},
];

export const broadcastFields: INodeProperties[] = [
	// Blockchain (EVM)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_BLOCKCHAINS),
		displayOptions: { show: { resource: ['broadcast'], blockchainType: ['evm'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_NETWORKS),
		displayOptions: { show: { resource: ['broadcast'], blockchainType: ['evm'] } },
	},
	// Blockchain (UTXO)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(UTXO_BLOCKCHAINS),
		displayOptions: { show: { resource: ['broadcast'], blockchainType: ['utxo'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(UTXO_NETWORKS),
		displayOptions: { show: { resource: ['broadcast'], blockchainType: ['utxo'] } },
	},
	// Network (XRP)
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(XRP_NETWORKS),
		displayOptions: { show: { resource: ['broadcast'], blockchainType: ['xrp'] } },
	},
	// Network (Solana)
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(SOLANA_NETWORKS),
		displayOptions: { show: { resource: ['broadcast'], blockchainType: ['solana'] } },
	},
	// Network (Tezos)
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(TEZOS_NETWORKS),
		displayOptions: { show: { resource: ['broadcast'], blockchainType: ['tezos'] } },
	},
	{
		displayName: 'Signed Transaction Hex',
		name: 'signedTransactionHex',
		type: 'string',
		required: true,
		default: '',
		description: 'The signed transaction hex to broadcast',
		displayOptions: { show: { resource: ['broadcast'] } },
	},
];
