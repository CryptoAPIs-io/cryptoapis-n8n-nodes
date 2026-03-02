import type { INodeProperties } from 'n8n-workflow';
import {
	blockchainOptions,
	networkOptions,
	EVM_BLOCKCHAINS,
	EVM_NETWORKS,
	UTXO_BLOCKCHAINS,
	UTXO_NETWORKS,
	XRP_NETWORKS,
} from '../../transport/blockchainConstants';

export const utilsOperations: INodeProperties[] = [
	{
		displayName: 'Blockchain Type',
		name: 'blockchainType',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['utils'] } },
		options: [
			{ name: 'EVM', value: 'evm' },
			{ name: 'UTXO', value: 'utxo' },
			{ name: 'XRP', value: 'xrp' },
		],
		default: 'evm',
	},
	// EVM operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['utils'], blockchainType: ['evm'] } },
		options: [
			{ name: 'Validate Address', value: 'validateAddress', description: 'Validate an EVM address', action: 'Validate address' },
			{ name: 'Decode Raw Transaction', value: 'decodeRawTransaction', description: 'Decode an EVM raw transaction hex', action: 'Decode raw transaction' },
			{ name: 'Derive Addresses', value: 'deriveAddresses', description: 'Derive addresses from an extended public key', action: 'Derive addresses' },
		],
		default: 'validateAddress',
	},
	// UTXO operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['utils'], blockchainType: ['utxo'] } },
		options: [
			{ name: 'Validate Address', value: 'validateAddress', description: 'Validate a UTXO address', action: 'Validate address' },
			{ name: 'Decode Raw Transaction', value: 'decodeRawTransaction', description: 'Decode a UTXO raw transaction hex', action: 'Decode raw transaction' },
			{ name: 'Convert Bitcoin Cash Address', value: 'convertBitcoinCashAddress', description: 'Convert between legacy and CashAddr formats (Bitcoin Cash only, regardless of selected blockchain)', action: 'Convert Bitcoin Cash address' },
			{ name: 'Derive Addresses', value: 'deriveAddresses', description: 'Derive addresses from an extended public key', action: 'Derive addresses' },
		],
		default: 'validateAddress',
	},
	// XRP operations
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['utils'], blockchainType: ['xrp'] } },
		options: [
			{ name: 'Validate Address', value: 'validateAddress', description: 'Validate an XRP address', action: 'Validate address' },
			{ name: 'Decode X-Address', value: 'decodeXAddress', description: 'Decode an X-Address to classic address + tag', action: 'Decode X-address' },
			{ name: 'Encode X-Address', value: 'encodeXAddress', description: 'Encode a classic address + tag into an X-Address', action: 'Encode X-address' },
			{ name: 'Derive Addresses', value: 'deriveAddresses', description: 'Derive addresses from an extended public key', action: 'Derive addresses' },
		],
		default: 'validateAddress',
	},
];

export const utilsFields: INodeProperties[] = [
	// --- EVM fields ---
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_BLOCKCHAINS),
		displayOptions: { show: { resource: ['utils'], blockchainType: ['evm'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_NETWORKS),
		displayOptions: { show: { resource: ['utils'], blockchainType: ['evm'] } },
	},

	// --- UTXO fields ---
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(UTXO_BLOCKCHAINS),
		displayOptions: { show: { resource: ['utils'], blockchainType: ['utxo'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(UTXO_NETWORKS),
		displayOptions: { show: { resource: ['utils'], blockchainType: ['utxo'] } },
	},

	// --- XRP fields ---
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(XRP_NETWORKS),
		displayOptions: { show: { resource: ['utils'], blockchainType: ['xrp'] } },
	},

	// --- Derive Addresses fields (shared across EVM, UTXO, XRP) ---
	{
		displayName: 'Extended Public Key',
		name: 'extendedPublicKey',
		type: 'string',
		required: true,
		default: '',
		description: 'xPub/yPub/zPub key',
		displayOptions: {
			show: { resource: ['utils'], operation: ['deriveAddresses'] },
		},
	},
	{
		displayName: 'Addresses Count',
		name: 'addressesCount',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 10 },
		default: 1,
		description: 'Number of addresses to derive (1-10)',
		displayOptions: {
			show: { resource: ['utils'], operation: ['deriveAddresses'] },
		},
	},
	{
		displayName: 'Start Index',
		name: 'startIndex',
		type: 'number',
		typeOptions: { minValue: 0 },
		default: 0,
		description: 'Starting index for derivation',
		displayOptions: {
			show: { resource: ['utils'], operation: ['deriveAddresses'] },
		},
	},
	{
		displayName: 'Address Format',
		name: 'addressFormat',
		type: 'options',
		default: '',
		options: [
			{ name: 'Default', value: '' },
			{ name: 'P2PKH (Legacy)', value: 'p2pkh' },
			{ name: 'P2SH', value: 'p2sh' },
			{ name: 'P2WPKH (SegWit)', value: 'p2wpkh' },
		],
		displayOptions: {
			show: { resource: ['utils'], blockchainType: ['utxo'], operation: ['deriveAddresses'] },
		},
	},
	{
		displayName: 'Is Change',
		name: 'isChange',
		type: 'boolean',
		default: false,
		description: 'Whether to derive change addresses (true) or receiving addresses (false)',
		displayOptions: {
			show: { resource: ['utils'], operation: ['deriveAddresses'] },
		},
	},

	// Address (for validate, decodeXAddress, convertBitcoinCashAddress)
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		description: 'The address to validate, decode, or convert',
		displayOptions: {
			show: {
				resource: ['utils'],
				operation: ['validateAddress', 'decodeXAddress', 'convertBitcoinCashAddress'],
			},
		},
	},

	// Raw Transaction Hex (for decode)
	{
		displayName: 'Raw Transaction Hex',
		name: 'rawTransactionHex',
		type: 'string',
		required: true,
		default: '',
		description: 'Raw transaction hex to decode',
		displayOptions: {
			show: { resource: ['utils'], operation: ['decodeRawTransaction'] },
		},
	},

	// XRP Encode X-Address fields
	{
		displayName: 'Classic Address',
		name: 'classicAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'XRP classic address',
		displayOptions: {
			show: { resource: ['utils'], operation: ['encodeXAddress'] },
		},
	},
	{
		displayName: 'Tag',
		name: 'tag',
		type: 'number',
		default: 0,
		description: 'Optional destination tag',
		displayOptions: {
			show: { resource: ['utils'], operation: ['encodeXAddress'] },
		},
	},
];
