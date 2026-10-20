import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { cryptoApisRequest, unwrapItems, unwrapSingleItem } from '../../transport/requestHelpers';

export async function executeAml(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;

	if (operation === 'verifyAddress') {
		const address = this.getNodeParameter('address', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `/aml/addresses/${encodeURIComponent(address)}`,
			resource: 'aml',
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'screenTransaction') {
		const blockchain = this.getNodeParameter('blockchain', index) as string;
		const transactionHash = this.getNodeParameter('transactionHash', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `/aml/transactions/${blockchain}/${encodeURIComponent(transactionHash)}`,
			resource: 'aml',
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'getAddressExposure') {
		const blockchain = this.getNodeParameter('exposureBlockchain', index) as string;
		const address = this.getNodeParameter('address', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `/aml/exposure/${blockchain}/${encodeURIComponent(address)}`,
			resource: 'aml',
		});
		return unwrapItems(response).map((item) => ({ json: item }));
	}

	if (operation === 'listAddressExposurePaths') {
		const blockchain = this.getNodeParameter('exposureBlockchain', index) as string;
		const address = this.getNodeParameter('address', index) as string;
		const limit = this.getNodeParameter('pageLimit', index) as number;
		const startingAfter = this.getNodeParameter('startingAfter', index) as string;
		const rootAddress = this.getNodeParameter('rootAddress', index) as string;

		const qs: IDataObject = { limit };
		if (startingAfter) qs.startingAfter = startingAfter;
		if (rootAddress) qs.rootAddress = rootAddress;

		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `/aml/exposure/${blockchain}/${encodeURIComponent(address)}/paths`,
			qs,
			resource: 'aml',
		});

		const meta = response.meta as IDataObject | undefined;
		const cursors = meta?.cursors as IDataObject | undefined;

		return [{
			json: {
				items: unwrapItems(response),
				hasMore: cursors?.hasMore ?? false,
				nextStartingAfter: cursors?.nextStartingAfter ?? null,
			},
		}];
	}

	throw new Error(`Unsupported AML operation: ${operation}`);
}
