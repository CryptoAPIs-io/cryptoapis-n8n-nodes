import type { INodeProperties } from 'n8n-workflow';
import { blockchainOptions, BROADCAST_BLOCKCHAINS } from '../../transport/blockchainConstants';

export const broadcastOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['broadcast'] } },
		options: [
			{ name: 'Broadcast Signed Transaction', value: 'broadcastSignedTransaction', description: 'Broadcast a signed transaction to the blockchain network', action: 'Broadcast signed transaction' },
		],
		default: 'broadcastSignedTransaction',
	},
];

export const broadcastFields: INodeProperties[] = [
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(BROADCAST_BLOCKCHAINS),
		displayOptions: { show: { resource: ['broadcast'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: [
			{ name: 'Mainnet', value: 'mainnet' },
			{ name: 'Testnet', value: 'testnet' },
			{ name: 'Sepolia', value: 'sepolia' },
			{ name: 'Mordor', value: 'mordor' },
			{ name: 'Amoy', value: 'amoy' },
			{ name: 'Nile', value: 'nile' },
			{ name: 'Fuji', value: 'fuji' },
		],
		displayOptions: { show: { resource: ['broadcast'] } },
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
