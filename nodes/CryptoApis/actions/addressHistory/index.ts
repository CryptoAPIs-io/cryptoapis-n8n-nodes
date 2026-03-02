import type { INodeProperties } from 'n8n-workflow';
import {
	blockchainOptions,
	networkOptions,
	EVM_BLOCKCHAINS,
	EVM_NETWORKS,
	UTXO_BLOCKCHAINS,
	UTXO_NETWORKS,
	ALL_BLOCKCHAINS,
} from '../../transport/blockchainConstants';

export const addressHistoryOperations: INodeProperties[] = [
	{
		displayName: 'Blockchain Type',
		name: 'blockchainType',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['addressHistory'] } },
		options: [
			{ name: 'Management (Sync/Activate/Delete)', value: 'management' },
			{ name: 'EVM', value: 'evm' },
			{ name: 'UTXO', value: 'utxo' },
		],
		default: 'management',
	},
	// Management operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['addressHistory'], blockchainType: ['management'] } },
		options: [
			{ name: 'Sync Address', value: 'syncAddress', description: 'Sync an address for full history tracking', action: 'Sync address' },
			{ name: 'List Synced Addresses', value: 'listSyncedAddresses', description: 'List all synced addresses', action: 'List synced addresses' },
			{ name: 'Activate Address', value: 'activateAddress', description: 'Activate a previously deactivated address sync', action: 'Activate address' },
			{ name: 'Delete Address', value: 'deleteAddress', description: 'Delete an address sync', action: 'Delete address' },
		],
		default: 'syncAddress',
	},
	// EVM operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['addressHistory'], blockchainType: ['evm'] } },
		options: [
			{ name: 'Get Statistics', value: 'getStatistics', description: 'Get address statistics (ETH/ETC only)', action: 'Get statistics' },
			{ name: 'List Transactions', value: 'listTransactions', description: 'List full transaction history for an address', action: 'List transactions' },
			{ name: 'List Token Transfers', value: 'listTokenTransfers', description: 'List full token transfer history', action: 'List token transfers' },
			{ name: 'List Internal Transactions', value: 'listInternalTransactions', description: 'List full internal transaction history', action: 'List internal transactions' },
			{ name: 'List Tokens', value: 'listTokens', description: 'List all tokens held by address', action: 'List tokens' },
		],
		default: 'listTransactions',
	},
	// UTXO operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['addressHistory'], blockchainType: ['utxo'] } },
		options: [
			{ name: 'Get Statistics', value: 'getStatistics', description: 'Get address statistics (BTC/BCH only)', action: 'Get statistics' },
			{ name: 'List Transactions', value: 'listTransactions', description: 'List full transaction history', action: 'List transactions' },
			{ name: 'List Unspent Outputs', value: 'listUnspentOutputs', description: 'List unspent transaction outputs (UTXOs)', action: 'List unspent outputs' },
		],
		default: 'listTransactions',
	},
];

export const addressHistoryFields: INodeProperties[] = [
	// Blockchain (Management)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(ALL_BLOCKCHAINS),
		displayOptions: { show: { resource: ['addressHistory'], blockchainType: ['management'] } },
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
		displayOptions: { show: { resource: ['addressHistory'], blockchainType: ['management'] } },
	},
	// Blockchain (EVM)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_BLOCKCHAINS),
		displayOptions: { show: { resource: ['addressHistory'], blockchainType: ['evm'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_NETWORKS),
		displayOptions: { show: { resource: ['addressHistory'], blockchainType: ['evm'] } },
	},
	// Blockchain (UTXO)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(UTXO_BLOCKCHAINS),
		displayOptions: { show: { resource: ['addressHistory'], blockchainType: ['utxo'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(UTXO_NETWORKS),
		displayOptions: { show: { resource: ['addressHistory'], blockchainType: ['utxo'] } },
	},
	// Address (not needed for listSyncedAddresses)
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		description: 'The blockchain address',
		displayOptions: {
			show: { resource: ['addressHistory'] },
			hide: { operation: ['listSyncedAddresses'] },
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
			show: {
				resource: ['addressHistory'],
				operation: ['listSyncedAddresses', 'listTransactions', 'listTokenTransfers', 'listInternalTransactions', 'listTokens', 'listUnspentOutputs'],
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
				resource: ['addressHistory'],
				operation: ['listSyncedAddresses', 'listTransactions', 'listTokenTransfers', 'listInternalTransactions', 'listTokens', 'listUnspentOutputs'],
				returnAll: [false],
			},
		},
	},
];
