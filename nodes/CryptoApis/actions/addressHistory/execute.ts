import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { cryptoApisRequest, unwrapSingleItem } from '../../transport/requestHelpers';
import { handleCursorPagination } from '../../transport/paginationHelpers';

export async function executeAddressHistory(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const blockchainType = this.getNodeParameter('blockchainType', index) as string;
	const operation = this.getNodeParameter('operation', index) as string;
	const blockchain = this.getNodeParameter('blockchain', index) as string;
	const network = this.getNodeParameter('network', index) as string;
	const address = operation === 'listSyncedAddresses'
		? ''
		: (this.getNodeParameter('address', index) as string);

	// --- Management operations ---
	// Real resource is /addresses-historical/manage/{blockchain}/{network}/... — the previous
	// implementation called a nonexistent /address-syncs/... resource (dead on every call).
	if (blockchainType === 'management') {
		if (operation === 'syncAddress') {
			const response = await cryptoApisRequest.call(this, {
				resource: 'addressHistory',
				method: 'POST',
				endpoint: `/addresses-historical/manage/${blockchain}/${network}`,
				body: { address } as IDataObject,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'listSyncedAddresses') {
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;
			const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
			const items = await handleCursorPagination.call(
				this,
				{ resource: 'addressHistory', method: 'GET', endpoint: `/addresses-historical/manage/${blockchain}/${network}` },
				returnAll,
				limit,
			);
			return items.map((item) => ({ json: item }));
		}

		if (operation === 'activateAddress') {
			// Spec method is POST, not PUT. Spec requires the { data: { item: {} } } wrapper even
			// though there are no actual fields — pass an empty body object to trigger it.
			const response = await cryptoApisRequest.call(this, {
				resource: 'addressHistory',
				method: 'POST',
				endpoint: `/addresses-historical/manage/${blockchain}/${network}/${encodeURIComponent(address)}/activate`,
				body: {},
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'deleteAddress') {
			const response = await cryptoApisRequest.call(this, {
				resource: 'addressHistory',
				method: 'DELETE',
				endpoint: `/addresses-historical/manage/${blockchain}/${network}/${encodeURIComponent(address)}`,
			});
			return [{ json: unwrapSingleItem(response) }];
		}
	}

	// --- EVM History ---
	// Real resource is /addresses-historical/evm/... (was /addresses-history/evm/...) with
	// "statistics" (was "stats"), "tokens-transfers" (was "token-transfers") segment names.
	if (blockchainType === 'evm') {
		const basePath = `/addresses-historical/evm/${blockchain}/${network}/${encodeURIComponent(address)}`;

		if (operation === 'getStatistics') {
			const response = await cryptoApisRequest.call(this, {
				resource: 'addressHistory',
				method: 'GET',
				endpoint: `${basePath}/statistics`,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'listTransactions') {
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;
			const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
			const items = await handleCursorPagination.call(
				this,
				{ resource: 'addressHistory', method: 'GET', endpoint: `${basePath}/transactions` },
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
				{ resource: 'addressHistory', method: 'GET', endpoint: `${basePath}/tokens-transfers` },
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
				{ resource: 'addressHistory', method: 'GET', endpoint: `${basePath}/internal-transactions` },
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
				{ resource: 'addressHistory', method: 'GET', endpoint: `${basePath}/tokens` },
				returnAll,
				limit,
			);
			return items.map((item) => ({ json: item }));
		}
	}

	// --- UTXO History ---
	// Real resource is /addresses-historical/utxo/... (was /addresses-history/utxo/...) with
	// "statistics" (was "stats") segment name.
	if (blockchainType === 'utxo') {
		const basePath = `/addresses-historical/utxo/${blockchain}/${network}/${encodeURIComponent(address)}`;

		if (operation === 'getStatistics') {
			const response = await cryptoApisRequest.call(this, {
				resource: 'addressHistory',
				method: 'GET',
				endpoint: `${basePath}/statistics`,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'listTransactions') {
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;
			const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
			const items = await handleCursorPagination.call(
				this,
				{ resource: 'addressHistory', method: 'GET', endpoint: `${basePath}/transactions` },
				returnAll,
				limit,
			);
			return items.map((item) => ({ json: item }));
		}

		if (operation === 'listUnspentOutputs') {
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;
			const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
			const items = await handleCursorPagination.call(
				this,
				{ resource: 'addressHistory', method: 'GET', endpoint: `${basePath}/unspent-outputs` },
				returnAll,
				limit,
			);
			return items.map((item) => ({ json: item }));
		}
	}

	throw new Error(`Unsupported Address History operation: ${operation}`);
}
