import type { INodeProperties } from 'n8n-workflow';

export const simulateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['simulate'] } },
		options: [
			{ name: 'Simulate Transaction', value: 'simulateTransaction', description: 'Dry-run an Ethereum transaction to preview its outcome without broadcasting', action: 'Simulate transaction' },
		],
		default: 'simulateTransaction',
	},
];

export const simulateFields: INodeProperties[] = [
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: [
			{ name: 'Mainnet', value: 'mainnet' },
			{ name: 'Sepolia', value: 'sepolia' },
		],
		displayOptions: { show: { resource: ['simulate'] } },
	},
	{
		displayName: 'From Address',
		name: 'fromAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'Sender address',
		displayOptions: { show: { resource: ['simulate'] } },
	},
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		default: '',
		description: 'Recipient address (optional for contract creation)',
		displayOptions: { show: { resource: ['simulate'] } },
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'string',
		default: '',
		description: 'Amount in wei (optional)',
		displayOptions: { show: { resource: ['simulate'] } },
	},
	{
		displayName: 'Calldata',
		name: 'data',
		type: 'string',
		default: '',
		description: 'Hex-encoded calldata (optional)',
		displayOptions: { show: { resource: ['simulate'] } },
	},
	{
		displayName: 'Gas Limit',
		name: 'gasLimit',
		type: 'number',
		default: 0,
		description: 'Gas limit override (optional, 0 = auto)',
		displayOptions: { show: { resource: ['simulate'] } },
	},
	{
		displayName: 'Gas Price',
		name: 'gasPrice',
		type: 'string',
		default: '',
		description: 'Gas price in wei (optional)',
		displayOptions: { show: { resource: ['simulate'] } },
	},
];
