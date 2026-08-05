import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { cryptoApisRequest, unwrapSingleItem } from '../../transport/requestHelpers';

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

	throw new Error(`Unsupported AML operation: ${operation}`);
}
