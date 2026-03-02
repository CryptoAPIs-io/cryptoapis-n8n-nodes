import type { INodeProperties } from 'n8n-workflow';

export const marketDataOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['marketData'],
			},
		},
		options: [
			{
				name: 'Get Asset Details by ID',
				value: 'getAssetDetailsById',
				description: 'Get detailed information about a specific asset by its CryptoAPIs asset ID',
				action: 'Get asset price and details using its ID',
			},
			{
				name: 'Get Asset Details by Symbol',
				value: 'getAssetDetailsBySymbol',
				description: 'Get detailed information about an asset by converting from one symbol to another',
				action: 'Get asset price and details using symbols (e.g. BTC/USD)',
			},
			{
				name: 'Get Exchange Rate by Asset Symbols',
				value: 'getExchangeRateBySymbols',
				description: 'Get exchange rate between two asset symbols (e.g. BTC to USD)',
				action: 'Get exchange rate between two symbols (e.g. BTC to USD)',
			},
			{
				name: 'Get Exchange Rate by Asset IDs',
				value: 'getExchangeRateByIds',
				description: 'Get exchange rate between two assets using their CryptoAPIs IDs',
				action: 'Get exchange rate between two assets by their IDs',
			},
			{
				name: 'List Supported Assets',
				value: 'listSupportedAssets',
				description: 'List all supported assets with metadata (crypto and fiat)',
				action: 'List all supported crypto and fiat assets',
			},
		],
		default: 'getAssetDetailsById',
	},
];

export const marketDataFields: INodeProperties[] = [
	// --- Get Asset Details by ID ---
	{
		displayName: 'Asset ID',
		name: 'assetId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 5b1ea92e584bf50020130612',
		description: 'CryptoAPIs asset ID',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getAssetDetailsById'],
			},
		},
	},

	// --- From/To Symbol (shared by getAssetDetailsBySymbol + getExchangeRateBySymbols) ---
	{
		displayName: 'From Symbol',
		name: 'fromSymbol',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. BTC',
		description: 'Source asset symbol',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getAssetDetailsBySymbol', 'getExchangeRateBySymbols'],
			},
		},
	},
	{
		displayName: 'To Symbol',
		name: 'toSymbol',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. USD',
		description: 'Target asset symbol',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getAssetDetailsBySymbol', 'getExchangeRateBySymbols'],
			},
		},
	},

	// --- Get Exchange Rate by IDs ---
	{
		displayName: 'From Asset ID',
		name: 'fromAssetId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 5b1ea92e584bf50020130612',
		description: 'Source asset CryptoAPIs ID',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getExchangeRateByIds'],
			},
		},
	},
	{
		displayName: 'To Asset ID',
		name: 'toAssetId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 5b1ea92e584bf50020130615',
		description: 'Target asset CryptoAPIs ID',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getExchangeRateByIds'],
			},
		},
	},

	// --- List Supported Assets ---
	{
		displayName: 'Asset Type',
		name: 'assetType',
		type: 'options',
		default: '',
		description: 'Filter assets by type',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Crypto', value: 'crypto' },
			{ name: 'Fiat', value: 'fiat' },
		],
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['listSupportedAssets'],
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['listSupportedAssets'],
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
				resource: ['marketData'],
				operation: ['listSupportedAssets'],
				returnAll: [false],
			},
		},
	},
];
