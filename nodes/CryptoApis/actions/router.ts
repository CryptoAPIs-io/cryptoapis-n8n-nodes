import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { executeMarketData } from './marketData/execute';
import { executeAddressLatest } from './addressLatest/execute';
import { executeBlockData } from './blockData/execute';
import { executeBlockchainFees } from './blockchainFees/execute';
import { executeTransactionsData } from './transactionsData/execute';
import { executeHdWallet } from './hdWallet/execute';
import { executeAddressHistory } from './addressHistory/execute';
import { executePrepareTransactions } from './prepareTransactions/execute';
import { executeSimulate } from './simulate/execute';
import { executeBroadcast } from './broadcast/execute';
import { executeBlockchainEvents } from './blockchainEvents/execute';
import { executeContracts } from './contracts/execute';
import { executeUtils } from './utils/execute';

export async function router(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const resource = this.getNodeParameter('resource', index) as string;

	switch (resource) {
		case 'marketData':
			return executeMarketData.call(this, index);
		case 'addressLatest':
			return executeAddressLatest.call(this, index);
		case 'blockData':
			return executeBlockData.call(this, index);
		case 'blockchainFees':
			return executeBlockchainFees.call(this, index);
		case 'transactionsData':
			return executeTransactionsData.call(this, index);
		case 'hdWallet':
			return executeHdWallet.call(this, index);
		case 'addressHistory':
			return executeAddressHistory.call(this, index);
		case 'prepareTransactions':
			return executePrepareTransactions.call(this, index);
		case 'simulate':
			return executeSimulate.call(this, index);
		case 'broadcast':
			return executeBroadcast.call(this, index);
		case 'blockchainEvents':
			return executeBlockchainEvents.call(this, index);
		case 'contracts':
			return executeContracts.call(this, index);
		case 'utils':
			return executeUtils.call(this, index);
		default:
			throw new Error(`Unknown resource: ${resource}`);
	}
}
