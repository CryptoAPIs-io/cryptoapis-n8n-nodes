import type { INodeProperties } from 'n8n-workflow';
import { blockchainOptions, networkOptions, SOLANA_NETWORKS } from '../../transport/blockchainConstants';

const EVM_CONTRACTS_BLOCKCHAINS = ['ethereum', 'ethereum-classic', 'binance-smart-chain'] as const;

export const contractsOperations: INodeProperties[] = [
	{
		displayName: 'Blockchain Type',
		name: 'blockchainType',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['contracts'] } },
		options: [
			{ name: 'EVM', value: 'evm' },
			{ name: 'Solana', value: 'solana' },
		],
		default: 'evm',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['contracts'] } },
		options: [
			{ name: 'Get Token Details by Contract', value: 'getTokenDetailsByContract', description: 'Get token details (name, symbol, decimals, total supply) by contract address', action: 'Get token name, symbol, and supply by contract address' },
		],
		default: 'getTokenDetailsByContract',
	},
];

export const contractsFields: INodeProperties[] = [
	// Blockchain (EVM)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_CONTRACTS_BLOCKCHAINS),
		displayOptions: { show: { resource: ['contracts'], blockchainType: ['evm'] } },
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
		],
		displayOptions: { show: { resource: ['contracts'], blockchainType: ['evm'] } },
	},
	// Network (Solana)
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(SOLANA_NETWORKS),
		displayOptions: { show: { resource: ['contracts'], blockchainType: ['solana'] } },
	},
	// Contract Address
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'The token contract address',
		displayOptions: { show: { resource: ['contracts'] } },
	},
];
