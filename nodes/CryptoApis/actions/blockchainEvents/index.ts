import type { INodeProperties } from 'n8n-workflow';
import { blockchainOptions, ALL_BLOCKCHAINS } from '../../transport/blockchainConstants';

export const blockchainEventsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['blockchainEvents'] } },
		options: [
			{ name: 'Create Subscription', value: 'createSubscription', description: 'Create a new blockchain event subscription (webhook)', action: 'Create subscription' },
			{ name: 'List Subscriptions', value: 'listSubscriptions', description: 'List all event subscriptions for a blockchain/network', action: 'List subscriptions' },
			{ name: 'Get Subscription', value: 'getSubscription', description: 'Get details of a specific subscription', action: 'Get subscription' },
			{ name: 'Delete Subscription', value: 'deleteSubscription', description: 'Delete a subscription', action: 'Delete subscription' },
			{ name: 'Activate Subscription', value: 'activateSubscription', description: 'Activate a deactivated subscription', action: 'Activate subscription' },
		],
		default: 'listSubscriptions',
	},
];

export const blockchainEventsFields: INodeProperties[] = [
	// Blockchain (for manage operations)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(ALL_BLOCKCHAINS),
		displayOptions: {
			show: {
				resource: ['blockchainEvents'],
				operation: ['listSubscriptions', 'getSubscription', 'deleteSubscription', 'activateSubscription'],
			},
		},
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		description: 'Available networks depend on the selected blockchain. Invalid pairs will be rejected by the API.',
		options: [
			{ name: 'Mainnet', value: 'mainnet' },
			{ name: 'Testnet', value: 'testnet' },
			{ name: 'Sepolia', value: 'sepolia' },
			{ name: 'Mordor', value: 'mordor' },
			{ name: 'Amoy', value: 'amoy' },
			{ name: 'Nile', value: 'nile' },
			{ name: 'Fuji', value: 'fuji' },
		],
		displayOptions: {
			show: {
				resource: ['blockchainEvents'],
				operation: ['listSubscriptions', 'getSubscription', 'deleteSubscription', 'activateSubscription'],
			},
		},
	},
	// Reference ID
	{
		displayName: 'Reference ID',
		name: 'referenceId',
		type: 'string',
		required: true,
		default: '',
		description: 'Subscription reference ID',
		displayOptions: {
			show: {
				resource: ['blockchainEvents'],
				operation: ['getSubscription', 'deleteSubscription', 'activateSubscription'],
			},
		},
	},
	// Create subscription fields
	{
		displayName: 'Event Type',
		name: 'eventType',
		type: 'options',
		required: true,
		default: 'CONFIRMED_COINS_TRANSACTION',
		options: [
			{ name: 'Unconfirmed Coins Transaction', value: 'UNCONFIRMED_COINS_TRANSACTION' },
			{ name: 'Confirmed Coins Transaction', value: 'CONFIRMED_COINS_TRANSACTION' },
			{ name: 'Unconfirmed Tokens Transaction', value: 'UNCONFIRMED_TOKENS_TRANSACTION' },
			{ name: 'Confirmed Tokens Transaction', value: 'CONFIRMED_TOKENS_TRANSACTION' },
			{ name: 'Unconfirmed Internal Transaction', value: 'UNCONFIRMED_INTERNAL_TRANSACTION' },
			{ name: 'Confirmed Internal Transaction', value: 'CONFIRMED_INTERNAL_TRANSACTION' },
			{ name: 'New Block', value: 'NEW_BLOCK' },
			{ name: 'Transaction Confirmations', value: 'TRANSACTION_CONFIRMATIONS' },
		],
		displayOptions: {
			show: { resource: ['blockchainEvents'], operation: ['createSubscription'] },
		},
	},
	{
		displayName: 'Callback URL',
		name: 'callbackUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'Webhook URL to receive event notifications',
		displayOptions: {
			show: { resource: ['blockchainEvents'], operation: ['createSubscription'] },
		},
	},
	{
		displayName: 'Callback Secret Key',
		name: 'callbackSecretKey',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		description: 'Optional HMAC secret key for callback signature verification',
		displayOptions: {
			show: { resource: ['blockchainEvents'], operation: ['createSubscription'] },
		},
	},
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(ALL_BLOCKCHAINS),
		displayOptions: {
			show: { resource: ['blockchainEvents'], operation: ['createSubscription'] },
		},
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		description: 'Available networks depend on the selected blockchain. Invalid pairs will be rejected by the API.',
		options: [
			{ name: 'Mainnet', value: 'mainnet' },
			{ name: 'Testnet', value: 'testnet' },
			{ name: 'Sepolia', value: 'sepolia' },
			{ name: 'Mordor', value: 'mordor' },
			{ name: 'Amoy', value: 'amoy' },
			{ name: 'Nile', value: 'nile' },
			{ name: 'Fuji', value: 'fuji' },
		],
		displayOptions: {
			show: { resource: ['blockchainEvents'], operation: ['createSubscription'] },
		},
	},
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		description: 'Address to monitor',
		displayOptions: {
			show: {
				resource: ['blockchainEvents'],
				operation: ['createSubscription'],
				eventType: [
					'UNCONFIRMED_COINS_TRANSACTION',
					'CONFIRMED_COINS_TRANSACTION',
					'UNCONFIRMED_TOKENS_TRANSACTION',
					'CONFIRMED_TOKENS_TRANSACTION',
					'UNCONFIRMED_INTERNAL_TRANSACTION',
					'CONFIRMED_INTERNAL_TRANSACTION',
				],
			},
		},
	},
	{
		displayName: 'Transaction ID',
		name: 'transactionId',
		type: 'string',
		required: true,
		default: '',
		description: 'Transaction ID to monitor for confirmations',
		displayOptions: {
			show: {
				resource: ['blockchainEvents'],
				operation: ['createSubscription'],
				eventType: ['TRANSACTION_CONFIRMATIONS'],
			},
		},
	},
	// Pagination
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: { resource: ['blockchainEvents'], operation: ['listSubscriptions'] },
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
			show: { resource: ['blockchainEvents'], operation: ['listSubscriptions'], returnAll: [false] },
		},
	},
];
