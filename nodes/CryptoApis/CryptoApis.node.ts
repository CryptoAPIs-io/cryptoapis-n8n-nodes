import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes } from 'n8n-workflow';
import { router } from './actions/router';

import { amlOperations, amlFields } from './actions/aml/index';
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
		// The wordmark is near-black (#020d1c), which all but disappears on n8n's
		// dark theme; the dark variant lightens only that fill and leaves the
		// brand blues untouched.
		icon: { light: 'file:cryptoapis.svg', dark: 'file:cryptoapis.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Crypto APIs — blockchain data, transactions, market data, and more',
		defaults: {
			name: 'Crypto APIs',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
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
					{ name: 'AML', value: 'aml', description: 'Anti-Money Laundering risk checks for addresses and transactions' },
					{ name: 'Block Data', value: 'blockData', description: 'Block details and block-level transactions' },
					{ name: 'Blockchain Event', value: 'blockchainEvents', description: 'Webhook subscriptions for on-chain events' },
					{ name: 'Blockchain Fee', value: 'blockchainFees', description: 'Fee recommendations, gas estimation, and Tezos/Solana fee estimates' },
					{ name: 'Broadcast', value: 'broadcast', description: 'Broadcast signed transactions to the network' },
					{ name: 'Contract', value: 'contracts', description: 'Token details by contract address' },
					{ name: 'HD Wallet', value: 'hdWallet', description: 'HD wallet sync, balances, and transactions' },
					{ name: 'Market Data', value: 'marketData', description: 'Asset prices and exchange rates' },
					{ name: 'Prepare Transaction', value: 'prepareTransactions', description: 'Build unsigned transactions for EVM, Tezos, Solana, XRP, Kaspa and UTXO' },
					{ name: 'Simulate', value: 'simulate', description: 'Dry-run Ethereum transactions' },
					{ name: 'Transaction Data', value: 'transactionsData', description: 'Transaction details, internals, and logs' },
					{ name: 'Utility', value: 'utils', description: 'Address validation, decoding, and derivation' },
				],
				default: 'marketData',
			},
			// Operations per resource
			...amlOperations,
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
			...amlFields,
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
				// cryptoApisRequest() already raises NodeApiError carrying the API's own
				// error body, so re-wrapping one would bury that detail — pass it through
				// unchanged and wrap only bare errors (a validation message, a transport
				// failure). Bound to a local first because `throw error` on the catch
				// parameter itself trips @n8n/community-nodes/require-node-api-error,
				// which matches the identifier and cannot see the instanceof guard.
				const failure =
					error instanceof NodeApiError
						? error
						: new NodeApiError(this.getNode(), error as JsonObject);
				throw failure;
			}
		}

		return [returnData];
	}
}
