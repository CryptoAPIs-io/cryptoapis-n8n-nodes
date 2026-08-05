import type { INodeProperties } from 'n8n-workflow';
import {
	blockchainOptions,
	networkOptions,
	UTXO_BLOCKCHAINS,
	UTXO_NETWORKS,
	XRP_NETWORKS,
} from '../../transport/blockchainConstants';
import {
	MANAGE_BLOCKCHAINS,
	MANAGE_NETWORKS,
	EVM_HD_WALLET_BLOCKCHAINS,
	EVM_HD_WALLET_NETWORKS,
} from './blockchainEnums';

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
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['hdWallet'] } },
		options: [
			{ name: 'Activate Wallet', value: 'activateWallet', description: 'Activate a previously deactivated wallet (Management)', action: 'Activate an HD wallet sync' },
			{ name: 'Delete Wallet', value: 'deleteWallet', description: 'Delete a synced HD wallet (Management)', action: 'Delete an HD wallet sync' },
			{ name: 'Derive Receiving Address', value: 'deriveReceivingAddress', description: 'Derive a new receiving address from xPub (EVM/UTXO/XRP)', action: 'Derive a new receiving address' },
			{ name: 'Get Details', value: 'getDetails', description: 'Get HD wallet details — balance, addresses count (EVM/UTXO/XRP)', action: 'Get HD wallet details and balance' },
			{ name: 'Get Sync Status', value: 'getSyncStatus', description: 'Get the sync status of an HD wallet (Management)', action: 'Get sync status of an HD wallet' },
			{ name: 'List Addresses', value: 'listAddresses', description: 'List derived addresses (EVM/UTXO/XRP)', action: 'List derived addresses of an HD wallet' },
			{ name: 'List Assets', value: 'listAssets', description: 'List assets held by the wallet (EVM/UTXO/XRP)', action: 'List assets held by an HD wallet' },
			{ name: 'List Transactions', value: 'listTransactions', description: 'List wallet transactions (EVM/UTXO/XRP)', action: 'List transactions of an HD wallet' },
			{ name: 'List Wallets', value: 'listWallets', description: 'List synced HD wallets (Management)', action: 'List all synced HD wallets' },
			{ name: 'Prepare Transaction', value: 'prepareTransaction', description: 'Prepare an unsigned transaction from the HD wallet (EVM/UTXO)', action: 'Prepare an unsigned HD wallet transaction' },
			{ name: 'Sync Wallet', value: 'syncWallet', description: 'Sync an xPub/yPub/zPub HD wallet (Management)', action: 'Sync a hierarchical deterministic wallet for tracking' },
		],
		default: 'syncWallet',
	},
];

export const hdWalletFields: INodeProperties[] = [
	// Blockchain (Management) — narrower than the generic ALL_BLOCKCHAINS union: includes xrp,
	// excludes L2s that have no HD-wallet endpoint at all (polygon/avalanche/arbitrum/base/optimism).
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(MANAGE_BLOCKCHAINS),
		displayOptions: { show: { resource: ['hdWallet'], blockchainType: ['management'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		description: 'Available networks depend on the selected blockchain. Invalid pairs will be rejected by the API.',
		options: networkOptions(MANAGE_NETWORKS),
		displayOptions: { show: { resource: ['hdWallet'], blockchainType: ['management'] } },
	},
	// Blockchain (EVM) — narrower than the generic EVM_BLOCKCHAINS union: only 4 of the 9 EVM
	// chains have HD-wallet endpoints (no polygon/avalanche/arbitrum/base/optimism).
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_HD_WALLET_BLOCKCHAINS),
		displayOptions: { show: { resource: ['hdWallet'], blockchainType: ['evm'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_HD_WALLET_NETWORKS),
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
		description: 'Extended public key of the HD wallet (xPub, yPub, or zPub)',
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
