import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { cryptoApisRequest, unwrapSingleItem } from '../../transport/requestHelpers';

export async function executePrepareTransactions(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const blockchain = this.getNodeParameter('blockchain', index) as string;
	const network = this.getNodeParameter('network', index) as string;
	const fromAddress = this.getNodeParameter('fromAddress', index) as string;
	const toAddress = this.getNodeParameter('toAddress', index) as string;
	const feePriority = this.getNodeParameter('feePriority', index, 'standard') as string;
	const gasLimit = this.getNodeParameter('gasLimit', index, '') as string;
	const gasPrice = this.getNodeParameter('gasPrice', index, '') as string;

	const basePath = `/prepare-transactions/evm/${blockchain}/${network}`;

	if (operation === 'prepareNativeCoinTransfer') {
		const amount = this.getNodeParameter('amount', index) as string;
		const body: IDataObject = {
			sender: fromAddress,
			recipient: toAddress,
			amount,
			fee: { priority: feePriority },
		};
		if (gasLimit) body.gasLimit = gasLimit;
		if (gasPrice) body.gasPrice = gasPrice;
		const response = await cryptoApisRequest.call(this, {
			method: 'POST',
			endpoint: `${basePath}/native-coins`,
			body,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'prepareFungibleTokenTransfer') {
		const contractAddress = this.getNodeParameter('contractAddress', index) as string;
		const tokenAmount = this.getNodeParameter('tokenAmount', index) as string;
		const body: IDataObject = {
			sender: fromAddress,
			recipient: toAddress,
			contractAddress,
			amount: tokenAmount,
			fee: { priority: feePriority },
		};
		if (gasLimit) body.gasLimit = gasLimit;
		if (gasPrice) body.gasPrice = gasPrice;
		const response = await cryptoApisRequest.call(this, {
			method: 'POST',
			endpoint: `${basePath}/fungible-tokens`,
			body,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'prepareNftTransfer') {
		const contractAddress = this.getNodeParameter('contractAddress', index) as string;
		const tokenId = this.getNodeParameter('tokenId', index) as string;
		const body: IDataObject = {
			sender: fromAddress,
			recipient: toAddress,
			contractAddress,
			tokenId,
			fee: { priority: feePriority },
		};
		if (gasLimit) body.gasLimit = gasLimit;
		if (gasPrice) body.gasPrice = gasPrice;
		const response = await cryptoApisRequest.call(this, {
			method: 'POST',
			endpoint: `${basePath}/non-fungible-tokens`,
			body,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	throw new Error(`Unsupported Prepare Transactions operation: ${operation}`);
}
