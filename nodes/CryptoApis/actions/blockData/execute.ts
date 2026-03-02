import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { cryptoApisRequest, unwrapSingleItem, unwrapItems } from '../../transport/requestHelpers';
import { handleOffsetPagination } from '../../transport/paginationHelpers';

function buildBasePath(blockchainType: string, blockchain: string, network: string): string {
	switch (blockchainType) {
		case 'evm':
			return `/blocks/evm/${blockchain}/${network}`;
		case 'utxo':
			return `/blocks/utxo/${blockchain}/${network}`;
		case 'xrp':
			return `/blocks/xrp/${network}`;
		default:
			throw new Error(`Unsupported blockchain type: ${blockchainType}`);
	}
}

export async function executeBlockData(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const blockchainType = this.getNodeParameter('blockchainType', index) as string;
	const operation = this.getNodeParameter('operation', index) as string;
	const blockchain = blockchainType === 'xrp' ? '' : (this.getNodeParameter('blockchain', index) as string);
	const network = this.getNodeParameter('network', index) as string;
	const basePath = buildBasePath(blockchainType, blockchain, network);

	if (operation === 'getBlockByHeight') {
		const blockHeight = this.getNodeParameter('blockHeight', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `${basePath}/height/${encodeURIComponent(blockHeight)}/details`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'getBlockByHash') {
		const blockHash = this.getNodeParameter('blockHash', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `${basePath}/hash/${encodeURIComponent(blockHash)}/details`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'listTransactionsByBlockHash') {
		const blockHash = this.getNodeParameter('blockHash', index) as string;
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
		const items = await handleOffsetPagination.call(
			this,
			{ method: 'GET', endpoint: `${basePath}/hash/${encodeURIComponent(blockHash)}/transactions` },
			returnAll,
			limit,
		);
		return items.map((item) => ({ json: item }));
	}

	if (operation === 'listTransactionsByBlockHeight') {
		const blockHeight = this.getNodeParameter('blockHeight', index) as string;
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
		const items = await handleOffsetPagination.call(
			this,
			{ method: 'GET', endpoint: `${basePath}/height/${encodeURIComponent(blockHeight)}/transactions` },
			returnAll,
			limit,
		);
		return items.map((item) => ({ json: item }));
	}

	if (operation === 'getLastMinedBlock') {
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `${basePath}/last`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'listLatestMinedBlocks') {
		const count = this.getNodeParameter('count', index) as number;
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `${basePath}/latest`,
			qs: { count } as IDataObject,
		});
		return unwrapItems(response).map((item) => ({ json: item }));
	}

	throw new Error(`Unsupported Block Data operation: ${operation}`);
}
