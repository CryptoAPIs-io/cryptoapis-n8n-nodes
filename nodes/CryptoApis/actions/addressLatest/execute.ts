import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { cryptoApisRequest, unwrapSingleItem } from '../../transport/requestHelpers';
import { handleCursorPagination } from '../../transport/paginationHelpers';

function buildBasePath(blockchainType: string, blockchain: string, network: string): string {
	switch (blockchainType) {
		case 'evm':
			return `/addresses-latest/evm/${blockchain}/${network}`;
		case 'utxo':
			return `/addresses-latest/utxo/${blockchain}/${network}`;
		case 'solana':
			return `/addresses-latest/solana/${network}`;
		case 'xrp':
			return `/addresses-latest/xrp/${network}`;
		case 'kaspa':
			return '/addresses-latest/kaspa';
		default:
			throw new Error(`Unsupported blockchain type: ${blockchainType}`);
	}
}

export async function executeAddressLatest(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const blockchainType = this.getNodeParameter('blockchainType', index) as string;
	const operation = this.getNodeParameter('operation', index) as string;
	const address = this.getNodeParameter('address', index) as string;

	const blockchain = blockchainType === 'kaspa' ? '' : (this.getNodeParameter('blockchain', index, '') as string);
	const network = blockchainType === 'kaspa' ? '' : (this.getNodeParameter('network', index, '') as string);
	const basePath = buildBasePath(blockchainType, blockchain, network);

	if (operation === 'getBalance') {
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `${basePath}/${encodeURIComponent(address)}/balance`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'getNextNonce') {
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `${basePath}/${encodeURIComponent(address)}/next-available-nonce`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'listTransactions') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
		const items = await handleCursorPagination.call(
			this,
			{ method: 'GET', endpoint: `${basePath}/${encodeURIComponent(address)}/transactions` },
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
			{ method: 'GET', endpoint: `${basePath}/${encodeURIComponent(address)}/token-transfers` },
			returnAll,
			limit,
		);
		return items.map((item) => ({ json: item }));
	}

	if (operation === 'listInternalTransactions') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
		const items = await handleCursorPagination.call(
			this,
			{ method: 'GET', endpoint: `${basePath}/${encodeURIComponent(address)}/internal-transactions` },
			returnAll,
			limit,
		);
		return items.map((item) => ({ json: item }));
	}

	if (operation === 'listTokens') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
		const items = await handleCursorPagination.call(
			this,
			{ method: 'GET', endpoint: `${basePath}/${encodeURIComponent(address)}/tokens` },
			returnAll,
			limit,
		);
		return items.map((item) => ({ json: item }));
	}

	throw new Error(`Unsupported Address Latest operation: ${operation}`);
}
