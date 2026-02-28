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
					{ name: 'Address History', value: 'addressHistory' },
					{ name: 'Address Latest', value: 'addressLatest' },
					{ name: 'Block Data', value: 'blockData' },
					{ name: 'Blockchain Events', value: 'blockchainEvents' },
					{ name: 'Blockchain Fees', value: 'blockchainFees' },
					{ name: 'Broadcast', value: 'broadcast' },
					{ name: 'Contracts', value: 'contracts' },
					{ name: 'HD Wallet', value: 'hdWallet' },
					{ name: 'Market Data', value: 'marketData' },
					{ name: 'Prepare Transactions', value: 'prepareTransactions' },
					{ name: 'Simulate', value: 'simulate' },
					{ name: 'Transactions Data', value: 'transactionsData' },
					{ name: 'Utils', value: 'utils' },
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
