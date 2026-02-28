import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { cryptoApisRequest, unwrapSingleItem } from '../../transport/requestHelpers';

export async function executeSimulate(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const network = this.getNodeParameter('network', index) as string;
	const fromAddress = this.getNodeParameter('fromAddress', index) as string;
	const toAddress = this.getNodeParameter('toAddress', index, '') as string;
	const value = this.getNodeParameter('value', index, '') as string;
	const data = this.getNodeParameter('data', index, '') as string;
	const gasLimit = this.getNodeParameter('gasLimit', index, 0) as number;
	const gasPrice = this.getNodeParameter('gasPrice', index, '') as string;

	const body: IDataObject = { sender: fromAddress };
	if (toAddress) body.recipient = toAddress;
	if (value) body.amount = value;
	if (data) body.inputData = data;
	if (gasLimit > 0) body.gasLimit = gasLimit;
	if (gasPrice) body.gasPrice = gasPrice;

	const response = await cryptoApisRequest.call(this, {
		method: 'POST',
		endpoint: `/simulate-transactions/evm/ethereum/${network}`,
		body,
	});
	return [{ json: unwrapSingleItem(response) }];
}
