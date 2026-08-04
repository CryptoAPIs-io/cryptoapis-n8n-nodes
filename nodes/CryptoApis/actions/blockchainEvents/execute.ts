import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { cryptoApisRequest, unwrapSingleItem } from '../../transport/requestHelpers';
import { handleOffsetPagination } from '../../transport/paginationHelpers';
import { EVENT_TYPES_REQUIRING_CONFIRMATIONS_COUNT } from './blockchainEnums';

export async function executeBlockchainEvents(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;

	if (operation === 'createSubscription') {
		// Real API has 8 dedicated per-event-type endpoints
		// (/blockchain-events/{blockchain}/{network}/{event-slug}), not a generic
		// POST /subscriptions -- eventType selects both the path segment and the field set.
		const eventType = this.getNodeParameter('eventType', index) as string;
		const blockchain = this.getNodeParameter('blockchain', index) as string;
		const network = this.getNodeParameter('network', index) as string;
		const callbackUrl = this.getNodeParameter('callbackUrl', index) as string;
		const callbackSecretKey = this.getNodeParameter('callbackSecretKey', index, '') as string;
		const allowDuplicates = this.getNodeParameter('allowDuplicates', index, false) as boolean;

		const body: IDataObject = { callbackUrl, allowDuplicates };
		if (callbackSecretKey) body.callbackSecretKey = callbackSecretKey;

		if (eventType !== 'block-mined') {
			body.address = this.getNodeParameter('address', index) as string;
		}
		if (EVENT_TYPES_REQUIRING_CONFIRMATIONS_COUNT.has(eventType)) {
			body.confirmationsCount = this.getNodeParameter('confirmationsCount', index) as number;
		} else if (['address-coins-transactions-confirmed', 'address-tokens-transactions-confirmed', 'address-internal-transactions-confirmed'].includes(eventType)) {
			const receiveCallbackOn = this.getNodeParameter('receiveCallbackOn', index, 0) as number;
			if (receiveCallbackOn > 0) body.receiveCallbackOn = receiveCallbackOn;
		}

		const response = await cryptoApisRequest.call(this, {
			resource: 'blockchainEvents',
			method: 'POST',
			endpoint: `/blockchain-events/${blockchain}/${network}/${eventType}`,
			body,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	const blockchain = this.getNodeParameter('blockchain', index) as string;
	const network = this.getNodeParameter('network', index) as string;
	const basePath = `/blockchain-events/${blockchain}/${network}`;

	if (operation === 'listSubscriptions') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
		const items = await handleOffsetPagination.call(
			this,
			{ method: 'GET', endpoint: basePath, resource: 'blockchainEvents' },
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
			resource: 'blockchainEvents',
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'deleteSubscription') {
		const referenceId = this.getNodeParameter('referenceId', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'DELETE',
			endpoint: `${basePath}/${encodeURIComponent(referenceId)}`,
			resource: 'blockchainEvents',
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'activateSubscription') {
		// Spec method is POST, not PUT. Spec requires the { data: { item: {} } } wrapper even
		// though there are no actual fields -- pass an empty body object to trigger it.
		const referenceId = this.getNodeParameter('referenceId', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'POST',
			endpoint: `${basePath}/${encodeURIComponent(referenceId)}/activate`,
			resource: 'blockchainEvents',
			body: {},
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	throw new Error(`Unsupported Blockchain Events operation: ${operation}`);
}
