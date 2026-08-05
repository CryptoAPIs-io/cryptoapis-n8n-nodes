import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { cryptoApisRequest, unwrapSingleItem } from '../../transport/requestHelpers';

export async function executeBroadcast(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const blockchainType = this.getNodeParameter('blockchainType', index) as string;
	// These have no separate Blockchain dropdown (blockchainType IS the chain name),
	// matching the pattern used elsewhere in this repo for single-chain blockchain types.
	const blockchain = ['xrp', 'solana', 'tezos'].includes(blockchainType)
		? blockchainType
		: (this.getNodeParameter('blockchain', index) as string);
	const network = this.getNodeParameter('network', index) as string;
	const signedTransactionHex = this.getNodeParameter('signedTransactionHex', index) as string;

	const response = await cryptoApisRequest.call(this, {
		method: 'POST',
		endpoint: `/broadcast-transactions/${blockchain}/${network}`,
		body: { signedTransactionHex } as IDataObject,
		resource: 'broadcast',
	});
	return [{ json: unwrapSingleItem(response) }];
}
