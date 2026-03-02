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
	if (blockchainType === 'management') {
		if (operation === 'syncAddress') {
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/address-syncs/${blockchain}/${network}`,
				body: { address } as IDataObject,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'listSyncedAddresses') {
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;
			const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
			const items = await handleCursorPagination.call(
				this,
				{ method: 'GET', endpoint: `/address-syncs/${blockchain}/${network}` },
				returnAll,
				limit,
			);
			return items.map((item) => ({ json: item }));
		}

		if (operation === 'activateAddress') {
			const response = await cryptoApisRequest.call(this, {
				method: 'PUT',
				endpoint: `/address-syncs/${blockchain}/${network}/${encodeURIComponent(address)}/activate`,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'deleteAddress') {
			const response = await cryptoApisRequest.call(this, {
				method: 'DELETE',
				endpoint: `/address-syncs/${blockchain}/${network}/${encodeURIComponent(address)}`,
			});
			return [{ json: unwrapSingleItem(response) }];
		}
	}

	// --- EVM History ---
	if (blockchainType === 'evm') {
		const basePath = `/addresses-history/evm/${blockchain}/${network}/${encodeURIComponent(address)}`;

		if (operation === 'getStatistics') {
			const response = await cryptoApisRequest.call(this, {
				method: 'GET',
				endpoint: `${basePath}/stats`,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'listTransactions') {
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;
			const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
			const items = await handleCursorPagination.call(
				this,
				{ method: 'GET', endpoint: `${basePath}/transactions` },
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
				{ method: 'GET', endpoint: `${basePath}/token-transfers` },
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
				{ method: 'GET', endpoint: `${basePath}/internal-transactions` },
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
				{ method: 'GET', endpoint: `${basePath}/tokens` },
				returnAll,
				limit,
			);
			return items.map((item) => ({ json: item }));
		}
	}

	// --- UTXO History ---
	if (blockchainType === 'utxo') {
		const basePath = `/addresses-history/utxo/${blockchain}/${network}/${encodeURIComponent(address)}`;

		if (operation === 'getStatistics') {
			const response = await cryptoApisRequest.call(this, {
				method: 'GET',
				endpoint: `${basePath}/stats`,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'listTransactions') {
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;
			const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
			const items = await handleCursorPagination.call(
				this,
				{ method: 'GET', endpoint: `${basePath}/transactions` },
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
				{ method: 'GET', endpoint: `${basePath}/unspent-outputs` },
				returnAll,
				limit,
			);
			return items.map((item) => ({ json: item }));
		}
	}

	throw new Error(`Unsupported Address History operation: ${operation}`);
}
