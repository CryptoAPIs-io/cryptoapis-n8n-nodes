import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { router } from './actions/router';

import { marketDataOperations, marketDataFields } from './actions/marketData/index';
import { addressLatestOperations, addressLatestFields } from './actions/addressLatest/index';
import { blockDataOperations, blockDataFields } from './actions/blockData/index';
import { blockchainFeesOperations, blockchainFeesFields } from './actions/blockchainFees/index';
import { transactionsDataOperations, transactionsDataFields } from './actions/transactionsData/index';
import { hdWalletOperations, hdWalletFields } from './actions/hdWallet/index';
import { addressHistoryOperations, addressHistoryFields } from './actions/addressHistory/index';
import { prepareTransactionsOperations, prepareTransactionsFields } from './actions/prepareTransactions/index';
import { simulateOperations, simulateFields } from './actions/simulate/index';
import { broadcastOperations, broadcastFields } from './actions/broadcast/index';
import { blockchainEventsOperations, blockchainEventsFields } from './actions/blockchainEvents/index';
import { contractsOperations, contractsFields } from './actions/contracts/index';
import { utilsOperations, utilsFields } from './actions/utils/index';


export class CryptoApis implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Crypto APIs',
		name: 'cryptoApis',
		icon: 'file:cryptoapis.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Crypto APIs — blockchain data, transactions, market data, and more',
		defaults: {
			name: 'Crypto APIs',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: 'cryptoApisApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Address History', value: 'addressHistory', description: 'Full transaction history for synced addresses' },
					{ name: 'Address Latest', value: 'addressLatest', description: 'Current balances and recent transactions' },
					{ name: 'Block Data', value: 'blockData', description: 'Block details and block-level transactions' },
					{ name: 'Blockchain Events', value: 'blockchainEvents', description: 'Webhook subscriptions for on-chain events' },
					{ name: 'Blockchain Fees', value: 'blockchainFees', description: 'Fee recommendations and gas estimation' },
					{ name: 'Broadcast', value: 'broadcast', description: 'Broadcast signed transactions to the network' },
					{ name: 'Contracts', value: 'contracts', description: 'Token details by contract address' },
					{ name: 'HD Wallet', value: 'hdWallet', description: 'HD wallet sync, balances, and transactions' },
					{ name: 'Market Data', value: 'marketData', description: 'Asset prices and exchange rates' },
					{ name: 'Prepare Transactions', value: 'prepareTransactions', description: 'Build unsigned EVM transactions' },
					{ name: 'Simulate', value: 'simulate', description: 'Dry-run Ethereum transactions' },
					{ name: 'Transactions Data', value: 'transactionsData', description: 'Transaction details, internals, and logs' },
					{ name: 'Utils', value: 'utils', description: 'Address validation, decoding, and derivation' },
				],
				default: 'marketData',
			},
			// Operations per resource
			...marketDataOperations,
			...addressLatestOperations,
			...blockDataOperations,
			...blockchainFeesOperations,
			...transactionsDataOperations,
			...hdWalletOperations,
			...addressHistoryOperations,
			...prepareTransactionsOperations,
			...simulateOperations,
			...broadcastOperations,
			...blockchainEventsOperations,
			...contractsOperations,
			...utilsOperations,
			// Fields per resource
			...marketDataFields,
			...addressLatestFields,
			...blockDataFields,
			...blockchainFeesFields,
			...transactionsDataFields,
			...hdWalletFields,
			...addressHistoryFields,
			...prepareTransactionsFields,
			...simulateFields,
			...broadcastFields,
			...blockchainEventsFields,
			...contractsFields,
			...utilsFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const result = await router.call(this, i);
				for (const item of result) {
					item.pairedItem = { item: i };
				}
				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
