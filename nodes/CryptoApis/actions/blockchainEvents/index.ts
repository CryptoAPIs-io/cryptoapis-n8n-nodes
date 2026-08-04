import type { INodeProperties } from 'n8n-workflow';
import { blockchainOptions, networkOptions } from '../../transport/blockchainConstants';
import {
	EVENT_TYPES,
	EVENT_TYPE_BLOCKCHAINS,
	EVENT_TYPE_NETWORKS,
	EVENT_TYPES_REQUIRING_CONFIRMATIONS_COUNT,
	MANAGE_BLOCKCHAINS,
	MANAGE_NETWORKS,
} from './blockchainEnums';

const EVENT_TYPE_LABELS: Record<string, string> = {
	'address-coins-transactions-unconfirmed': 'Address Coins Transactions Unconfirmed',
	'address-coins-transactions-confirmed': 'Address Coins Transactions Confirmed',
	'address-coins-transactions-confirmed-each-confirmation': 'Address Coins Transactions Confirmed (Each Confirmation)',
	'address-tokens-transactions-confirmed': 'Address Tokens Transactions Confirmed',
	'address-tokens-transactions-confirmed-each-confirmation': 'Address Tokens Transactions Confirmed (Each Confirmation)',
	'address-internal-transactions-confirmed': 'Address Internal Transactions Confirmed',
	'address-internal-transactions-confirmed-each-confirmation': 'Address Internal Transactions Confirmed (Each Confirmation)',
	'block-mined': 'Block Mined',
};

const RECEIVE_CALLBACK_ON_EVENT_TYPES = [
	'address-coins-transactions-confirmed',
	'address-tokens-transactions-confirmed',
	'address-internal-transactions-confirmed',
];

export const blockchainEventsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['blockchainEvents'] } },
		options: [
			{ name: 'Create Subscription', value: 'createSubscription', description: 'Create a new blockchain event subscription (webhook)', action: 'Create a webhook subscription for on-chain events' },
			{ name: 'List Subscriptions', value: 'listSubscriptions', description: 'List all event subscriptions for a blockchain/network', action: 'List all webhook event subscriptions' },
			{ name: 'Get Subscription', value: 'getSubscription', description: 'Get details of a specific subscription', action: 'Get details of a specific webhook subscription' },
			{ name: 'Delete Subscription', value: 'deleteSubscription', description: 'Delete a subscription', action: 'Delete a webhook event subscription' },
			{ name: 'Activate Subscription', value: 'activateSubscription', description: 'Activate a deactivated subscription', action: 'Activate a deactivated webhook subscription' },
		],
		default: 'listSubscriptions',
	},
];

const eventTypePerBlockchainFields: INodeProperties[] = EVENT_TYPES.flatMap((eventType) => [
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: EVENT_TYPE_BLOCKCHAINS[eventType][0],
		options: blockchainOptions(EVENT_TYPE_BLOCKCHAINS[eventType]),
		displayOptions: { show: { resource: ['blockchainEvents'], operation: ['createSubscription'], eventType: [eventType] } },
	} as INodeProperties,
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVENT_TYPE_NETWORKS[eventType]),
		displayOptions: { show: { resource: ['blockchainEvents'], operation: ['createSubscription'], eventType: [eventType] } },
	} as INodeProperties,
]);

export const blockchainEventsFields: INodeProperties[] = [
	// Blockchain/Network (management: list/get/delete/activate) — uniform 19-chain union.
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(MANAGE_BLOCKCHAINS),
		displayOptions: { show: { resource: ['blockchainEvents'], operation: ['listSubscriptions', 'getSubscription', 'deleteSubscription', 'activateSubscription'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(MANAGE_NETWORKS),
		displayOptions: { show: { resource: ['blockchainEvents'], operation: ['listSubscriptions', 'getSubscription', 'deleteSubscription', 'activateSubscription'] } },
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
			show: { resource: ['blockchainEvents'], operation: ['getSubscription', 'deleteSubscription', 'activateSubscription'] },
		},
	},
	// Create subscription fields
	{
		displayName: 'Event Type',
		name: 'eventType',
		type: 'options',
		required: true,
		default: 'block-mined',
		options: EVENT_TYPES.map((v) => ({ name: EVENT_TYPE_LABELS[v], value: v })),
		description: 'The 8 event types this endpoint actually supports — supported blockchains vary per type',
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
		displayName: 'Allow Duplicates',
		name: 'allowDuplicates',
		type: 'boolean',
		default: false,
		description: 'Whether to allow duplicate subscriptions for the same address/event. The API requires this field even though the spec marks it optional (verified live).',
		displayOptions: {
			show: { resource: ['blockchainEvents'], operation: ['createSubscription'] },
		},
	},
	// Per-event-type blockchain/network dropdowns (support varies significantly per event type)
	...eventTypePerBlockchainFields,
	// Address (all event types except block-mined)
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		description: 'Address to monitor (required for all event types except Block Mined)',
		displayOptions: {
			show: {
				resource: ['blockchainEvents'],
				operation: ['createSubscription'],
				eventType: EVENT_TYPES.filter((v) => v !== 'block-mined'),
			},
		},
	},
	// Confirmations Count (the 3 "-each-confirmation" event types)
	{
		displayName: 'Confirmations Count',
		name: 'confirmationsCount',
		type: 'number',
		required: true,
		default: 1,
		description: 'Number of confirmations to track, sending a callback on each one',
		displayOptions: {
			show: {
				resource: ['blockchainEvents'],
				operation: ['createSubscription'],
				eventType: Array.from(EVENT_TYPES_REQUIRING_CONFIRMATIONS_COUNT),
			},
		},
	},
	// Receive Callback On (the 3 non-each-confirmation "confirmed" event types)
	{
		displayName: 'Receive Callback On',
		name: 'receiveCallbackOn',
		type: 'number',
		default: 0,
		description: 'Optional: exact confirmation number to receive the callback on (0 = default behavior)',
		displayOptions: {
			show: {
				resource: ['blockchainEvents'],
				operation: ['createSubscription'],
				eventType: RECEIVE_CALLBACK_ON_EVENT_TYPES,
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
