import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { cryptoApisRequest, unwrapSingleItem } from '../../transport/requestHelpers';
import { handleCursorPagination } from '../../transport/paginationHelpers';

function buildBasePath(blockchainType: string, blockchain: string, network: string): string {
	switch (blockchainType) {
		case 'evm':
			return `/transactions/evm/${blockchain}/${network}`;
		case 'utxo':
			return `/transactions/utxo/${blockchain}/${network}`;
		case 'solana':
			return `/transactions/solana/${network}`;
		case 'xrp':
			return `/transactions/xrp/${network}`;
		case 'kaspa':
			return '/transactions/kaspa';
		default:
			throw new Error(`Unsupported blockchain type: ${blockchainType}`);
	}
}

export async function executeTransactionsData(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const blockchainType = this.getNodeParameter('blockchainType', index) as string;
	const operation = this.getNodeParameter('operation', index) as string;
	const transactionHash = this.getNodeParameter('transactionHash', index) as string;

	const blockchain = ['evm', 'utxo'].includes(blockchainType)
		? (this.getNodeParameter('blockchain', index) as string)
		: '';
	const network = blockchainType === 'kaspa' ? '' : (this.getNodeParameter('network', index) as string);
	const basePath = buildBasePath(blockchainType, blockchain, network);

	if (operation === 'getTransactionDetails') {
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `${basePath}/${encodeURIComponent(transactionHash)}`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'getRawTransactionData') {
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `${basePath}/${encodeURIComponent(transactionHash)}/raw`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'listInternalTransactions') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
		const items = await handleCursorPagination.call(
			this,
			{ method: 'GET', endpoint: `${basePath}/${encodeURIComponent(transactionHash)}/internal-transactions` },
			returnAll,
			limit,
		);
		return items.map((item) => ({ json: item }));
	}

	if (operation === 'listTokenTransfers') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
		const items = await handleCursorPagination.call(
			this,
			{ method: 'GET', endpoint: `${basePath}/${encodeURIComponent(transactionHash)}/token-transfers` },
			returnAll,
			limit,
		);
		return items.map((item) => ({ json: item }));
	}

	if (operation === 'listLogs') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
		const items = await handleCursorPagination.call(
			this,
			{ method: 'GET', endpoint: `${basePath}/${encodeURIComponent(transactionHash)}/logs` },
			returnAll,
			limit,
		);
		return items.map((item) => ({ json: item }));
	}

	throw new Error(`Unsupported Transactions Data operation: ${operation}`);
}
