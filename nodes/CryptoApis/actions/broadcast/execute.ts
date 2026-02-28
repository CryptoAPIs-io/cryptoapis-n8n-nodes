import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { cryptoApisRequest, unwrapSingleItem } from '../../transport/requestHelpers';

export async function executeBroadcast(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const blockchain = this.getNodeParameter('blockchain', index) as string;
	const network = this.getNodeParameter('network', index) as string;
	const signedTransactionHex = this.getNodeParameter('signedTransactionHex', index) as string;

	const response = await cryptoApisRequest.call(this, {
		method: 'POST',
		endpoint: `/broadcast-transactions/${blockchain}/${network}`,
		body: { signedTransactionHex } as IDataObject,
	});
	return [{ json: unwrapSingleItem(response) }];
}
