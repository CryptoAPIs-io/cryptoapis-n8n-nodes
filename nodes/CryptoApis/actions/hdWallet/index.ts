import type { INodeProperties } from 'n8n-workflow';
import {
	blockchainOptions,
	networkOptions,
	EVM_BLOCKCHAINS,
	EVM_NETWORKS,
	UTXO_BLOCKCHAINS,
	UTXO_NETWORKS,
	XRP_NETWORKS,
	ALL_BLOCKCHAINS,
} from '../../transport/blockchainConstants';

export const hdWalletOperations: INodeProperties[] = [
	{
		displayName: 'Blockchain Type',
		name: 'blockchainType',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['hdWallet'] } },
		options: [
			{ name: 'Management (All Blockchains)', value: 'management' },
			{ name: 'EVM', value: 'evm' },
			{ name: 'UTXO', value: 'utxo' },
			{ name: 'XRP', value: 'xrp' },
		],
		default: 'management',
	},
	// Management operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['hdWallet'], blockchainType: ['management'] } },
		options: [
			{ name: 'Sync Wallet', value: 'syncWallet', description: 'Sync an xPub/yPub/zPub HD wallet', action: 'Sync wallet' },
			{ name: 'List Wallets', value: 'listWallets', description: 'List synced HD wallets', action: 'List wallets' },
			{ name: 'Activate Wallet', value: 'activateWallet', description: 'Activate a previously deactivated wallet', action: 'Activate wallet' },
			{ name: 'Delete Wallet', value: 'deleteWallet', description: 'Delete a synced HD wallet', action: 'Delete wallet' },
			{ name: 'Get Sync Status', value: 'getSyncStatus', description: 'Get the sync status of an HD wallet', action: 'Get sync status' },
		],
		default: 'syncWallet',
	},
	// EVM operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['hdWallet'], blockchainType: ['evm'] } },
		options: [
			{ name: 'Derive Receiving Address', value: 'deriveReceivingAddress', description: 'Derive a new receiving address from xPub', action: 'Derive receiving address' },
			{ name: 'Get Details', value: 'getDetails', description: 'Get HD wallet details (balance, addresses count)', action: 'Get details' },
			{ name: 'List Addresses', value: 'listAddresses', description: 'List derived addresses', action: 'List addresses' },
			{ name: 'List Transactions', value: 'listTransactions', description: 'List wallet transactions', action: 'List transactions' },
			{ name: 'List Assets', value: 'listAssets', description: 'List assets held by the wallet', action: 'List assets' },
			{ name: 'Prepare Transaction', value: 'prepareTransaction', description: 'Prepare an unsigned transaction from the HD wallet', action: 'Prepare transaction' },
		],
		default: 'getDetails',
	},
	// UTXO operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['hdWallet'], blockchainType: ['utxo'] } },
		options: [
			{ name: 'Derive Receiving Address', value: 'deriveReceivingAddress', description: 'Derive a new receiving address from xPub', action: 'Derive receiving address' },
			{ name: 'Get Details', value: 'getDetails', description: 'Get HD wallet details', action: 'Get details' },
			{ name: 'List Addresses', value: 'listAddresses', description: 'List derived addresses', action: 'List addresses' },
			{ name: 'List Transactions', value: 'listTransactions', description: 'List wallet transactions', action: 'List transactions' },
			{ name: 'List Assets', value: 'listAssets', description: 'List assets held by the wallet', action: 'List assets' },
			{ name: 'Prepare Transaction', value: 'prepareTransaction', description: 'Prepare an unsigned UTXO transaction', action: 'Prepare transaction' },
		],
		default: 'getDetails',
	},
	// XRP operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['hdWallet'], blockchainType: ['xrp'] } },
		options: [
			{ name: 'Derive Receiving Address', value: 'deriveReceivingAddress', description: 'Derive a new receiving address from xPub', action: 'Derive receiving address' },
			{ name: 'Get Details', value: 'getDetails', description: 'Get HD wallet details', action: 'Get details' },
			{ name: 'List Addresses', value: 'listAddresses', description: 'List derived addresses', action: 'List addresses' },
			{ name: 'List Transactions', value: 'listTransactions', description: 'List wallet transactions', action: 'List transactions' },
			{ name: 'List Assets', value: 'listAssets', description: 'List assets held by the wallet', action: 'List assets' },
		],
		default: 'getDetails',
	},
];

export const hdWalletFields: INodeProperties[] = [
	// Blockchain (Management)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(ALL_BLOCKCHAINS),
		displayOptions: { show: { resource: ['hdWallet'], blockchainType: ['management'] } },
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
		displayOptions: { show: { resource: ['hdWallet'], blockchainType: ['management'] } },
	},
	// Blockchain (EVM)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_BLOCKCHAINS),
		displayOptions: { show: { resource: ['hdWallet'], blockchainType: ['evm'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_NETWORKS),
		displayOptions: { show: { resource: ['hdWallet'], blockchainType: ['evm'] } },
	},
	// Blockchain (UTXO)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(UTXO_BLOCKCHAINS),
		displayOptions: { show: { resource: ['hdWallet'], blockchainType: ['utxo'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(UTXO_NETWORKS),
		displayOptions: { show: { resource: ['hdWallet'], blockchainType: ['utxo'] } },
	},
	// Network (XRP)
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(XRP_NETWORKS),
		displayOptions: { show: { resource: ['hdWallet'], blockchainType: ['xrp'] } },
	},
	// Extended Public Key (not needed for listWallets)
	{
		displayName: 'Extended Public Key',
		name: 'extendedPublicKey',
		type: 'string',
		required: true,
		default: '',
		description: 'xPub, yPub, or zPub key of the HD wallet',
		displayOptions: {
			show: { resource: ['hdWallet'] },
			hide: { operation: ['listWallets'] },
		},
	},
	// Prepare Transaction fields (EVM)
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'Recipient address',
		displayOptions: {
			show: { resource: ['hdWallet'], blockchainType: ['evm'], operation: ['prepareTransaction'] },
		},
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'string',
		required: true,
		default: '',
		description: 'Amount in native coin smallest unit (e.g. wei)',
		displayOptions: {
			show: { resource: ['hdWallet'], blockchainType: ['evm'], operation: ['prepareTransaction'] },
		},
	},
	{
		displayName: 'Calldata',
		name: 'data',
		type: 'string',
		default: '',
		description: 'Optional hex-encoded calldata for contract interactions',
		displayOptions: {
			show: { resource: ['hdWallet'], blockchainType: ['evm'], operation: ['prepareTransaction'] },
		},
	},
	// Prepare Transaction fields (UTXO)
	{
		displayName: 'Recipients (JSON)',
		name: 'recipients',
		type: 'json',
		required: true,
		default: '[\n  { "address": "", "amount": "" }\n]',
		description: 'Array of { address, amount } recipients',
		displayOptions: {
			show: { resource: ['hdWallet'], blockchainType: ['utxo'], operation: ['prepareTransaction'] },
		},
	},
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
		displayOptions: {
			show: { resource: ['hdWallet'], operation: ['prepareTransaction'] },
		},
	},
	// Address Format (UTXO)
	{
		displayName: 'Address Format',
		name: 'addressFormat',
		type: 'options',
		default: 'p2wpkh',
		options: [
			{ name: 'P2PKH (Legacy)', value: 'p2pkh' },
			{ name: 'P2SH', value: 'p2sh' },
			{ name: 'P2WPKH (SegWit)', value: 'p2wpkh' },
		],
		displayOptions: {
			show: { resource: ['hdWallet'], blockchainType: ['utxo'], operation: ['deriveReceivingAddress'] },
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
				resource: ['hdWallet'],
				operation: ['listWallets', 'listAddresses', 'listTransactions', 'listAssets'],
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
				resource: ['hdWallet'],
				operation: ['listWallets', 'listAddresses', 'listTransactions', 'listAssets'],
				returnAll: [false],
			},
		},
	},
];
