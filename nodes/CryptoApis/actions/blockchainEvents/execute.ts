import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { cryptoApisRequest, unwrapSingleItem } from '../../transport/requestHelpers';
import { handleOffsetPagination } from '../../transport/paginationHelpers';

export async function executeBlockchainEvents(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;

	if (operation === 'createSubscription') {
		const eventType = this.getNodeParameter('eventType', index) as string;
		const callbackUrl = this.getNodeParameter('callbackUrl', index) as string;
		const callbackSecretKey = this.getNodeParameter('callbackSecretKey', index, '') as string;
		const blockchain = this.getNodeParameter('blockchain', index, '') as string;
		const network = this.getNodeParameter('network', index, '') as string;
		const address = this.getNodeParameter('address', index, '') as string;
		const transactionId = this.getNodeParameter('transactionId', index, '') as string;

		const body: IDataObject = {
			eventType,
			callbackUrl,
		};
		if (callbackSecretKey) body.callbackSecretKey = callbackSecretKey;
		if (blockchain) body.blockchain = blockchain;
		if (network) body.network = network;
		if (address) body.address = address;
		if (transactionId) body.transactionId = transactionId;

		const response = await cryptoApisRequest.call(this, {
			method: 'POST',
			endpoint: '/subscriptions',
			body,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	const blockchain = this.getNodeParameter('blockchain', index) as string;
	const network = this.getNodeParameter('network', index) as string;
	const basePath = `/subscriptions/${blockchain}/${network}`;

	if (operation === 'listSubscriptions') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
		const items = await handleOffsetPagination.call(
			this,
			{ method: 'GET', endpoint: basePath },
			returnAll,
			limit,
		);
		return items.map((item) => ({ json: item }));
	}

	if (operation === 'getSubscription') {
		const referenceId = this.getNodeParameter('referenceId', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `${basePath}/${encodeURIComponent(referenceId)}`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'deleteSubscription') {
		const referenceId = this.getNodeParameter('referenceId', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'DELETE',
			endpoint: `${basePath}/${encodeURIComponent(referenceId)}`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'activateSubscription') {
		const referenceId = this.getNodeParameter('referenceId', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'PUT',
			endpoint: `${basePath}/${encodeURIComponent(referenceId)}/activate`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	throw new Error(`Unsupported Blockchain Events operation: ${operation}`);
}
