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
			// Spec requires the {network} segment -- was missing entirely, making every Kaspa call dead.
			return `/transactions/kaspa/${network}`;
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
	// Kaspa requires the network segment too (mainnet only, per spec) -- was previously omitted.
	const network = this.getNodeParameter('network', index) as string;
	const basePath = buildBasePath(blockchainType, blockchain, network);

	if (operation === 'getTransactionDetails') {
		// Solana's spec path has a required /details suffix; every other blockchain type's
		// getTransactionDetails path is bare {transactionHash} with no suffix.
		const suffix = blockchainType === 'solana' ? '/details' : '';
		const response = await cryptoApisRequest.call(this, {
			resource: 'transactionsData',
			method: 'GET',
			endpoint: `${basePath}/${encodeURIComponent(transactionHash)}${suffix}`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'getRawTransactionData') {
		// Spec segment is raw-data, not raw. Only exists for UTXO -- the Operation dropdown's
		// displayOptions restrict this to blockchainType: utxo.
		const response = await cryptoApisRequest.call(this, {
			resource: 'transactionsData',
			method: 'GET',
			endpoint: `${basePath}/${encodeURIComponent(transactionHash)}/raw-data`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'listInternalTransactions') {
		// Spec segment is internal, not internal-transactions.
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
		const items = await handleCursorPagination.call(
			this,
			{ resource: 'transactionsData', method: 'GET', endpoint: `${basePath}/${encodeURIComponent(transactionHash)}/internal` },
			returnAll,
			limit,
		);
		return items.map((item) => ({ json: item }));
	}

	if (operation === 'listTokenTransfers') {
		// Spec segment is tokens-transfers, not token-transfers.
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
		const items = await handleCursorPagination.call(
			this,
			{ resource: 'transactionsData', method: 'GET', endpoint: `${basePath}/${encodeURIComponent(transactionHash)}/tokens-transfers` },
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
			{ resource: 'transactionsData', method: 'GET', endpoint: `${basePath}/${encodeURIComponent(transactionHash)}/logs` },
			returnAll,
			limit,
		);
		return items.map((item) => ({ json: item }));
	}

	throw new Error(`Unsupported Transactions Data operation: ${operation}`);
}
