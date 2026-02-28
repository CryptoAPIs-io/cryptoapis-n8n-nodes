import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { cryptoApisRequest, unwrapSingleItem, unwrapItems } from '../../transport/requestHelpers';
import { handleOffsetPagination, handleCursorPagination } from '../../transport/paginationHelpers';

function buildManagePath(blockchain: string, network: string): string {
	return `/hd-wallets/${blockchain}/${network}`;
}

function buildDataPath(blockchainType: string, blockchain: string, network: string): string {
	if (blockchainType === 'xrp') return `/hd-wallets/xrp/${network}`;
	return `/hd-wallets/${blockchainType}/${blockchain}/${network}`;
}

export async function executeHdWallet(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const blockchainType = this.getNodeParameter('blockchainType', index) as string;
	const operation = this.getNodeParameter('operation', index) as string;
	const extendedPublicKey = operation === 'listWallets'
		? ''
		: (this.getNodeParameter('extendedPublicKey', index) as string);

	// --- Management operations ---
	if (blockchainType === 'management') {
		const blockchain = this.getNodeParameter('blockchain', index) as string;
		const network = this.getNodeParameter('network', index) as string;
		const basePath = buildManagePath(blockchain, network);

		if (operation === 'syncWallet') {
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `${basePath}/xpubs/sync`,
				body: { extendedPublicKey } as IDataObject,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'listWallets') {
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;
			const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
			const items = await handleOffsetPagination.call(
				this,
				{ method: 'GET', endpoint: `${basePath}/xpubs` },
				returnAll,
				limit,
			);
			return items.map((item) => ({ json: item }));
		}

		if (operation === 'activateWallet') {
			const response = await cryptoApisRequest.call(this, {
				method: 'PUT',
				endpoint: `${basePath}/${encodeURIComponent(extendedPublicKey)}/activate`,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'deleteWallet') {
			const response = await cryptoApisRequest.call(this, {
				method: 'DELETE',
				endpoint: `${basePath}/${encodeURIComponent(extendedPublicKey)}`,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'getSyncStatus') {
			const response = await cryptoApisRequest.call(this, {
				method: 'GET',
				endpoint: `${basePath}/${encodeURIComponent(extendedPublicKey)}/status`,
			});
			return [{ json: unwrapSingleItem(response) }];
		}
	}

	// --- Data operations (EVM, UTXO, XRP) ---
	const blockchain = blockchainType === 'xrp' ? '' : (this.getNodeParameter('blockchain', index) as string);
	const network = this.getNodeParameter('network', index) as string;
	const basePath = buildDataPath(blockchainType, blockchain, network);

	if (operation === 'getDetails') {
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `${basePath}/${encodeURIComponent(extendedPublicKey)}`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'deriveReceivingAddress') {
		const body: IDataObject = { extendedPublicKey };
		if (blockchainType === 'utxo') {
			const addressFormat = this.getNodeParameter('addressFormat', index, 'p2wpkh') as string;
			body.addressFormat = addressFormat;
		}
		const response = await cryptoApisRequest.call(this, {
			method: 'POST',
			endpoint: `${basePath}/xpubs/derive-addresses`,
			body,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'listAddresses') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
		const items = await handleOffsetPagination.call(
			this,
			{ method: 'GET', endpoint: `${basePath}/${encodeURIComponent(extendedPublicKey)}/addresses` },
			returnAll,
			limit,
		);
		return items.map((item) => ({ json: item }));
	}

	if (operation === 'listTransactions') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
		const items = await handleCursorPagination.call(
			this,
			{ method: 'GET', endpoint: `${basePath}/${encodeURIComponent(extendedPublicKey)}/transactions` },
			returnAll,
			limit,
		);
		return items.map((item) => ({ json: item }));
	}

	if (operation === 'listAssets') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
		const items = await handleOffsetPagination.call(
			this,
			{ method: 'GET', endpoint: `${basePath}/${encodeURIComponent(extendedPublicKey)}/assets` },
			returnAll,
			limit,
		);
		return items.map((item) => ({ json: item }));
	}

	if (operation === 'prepareTransaction') {
		const feePriority = this.getNodeParameter('feePriority', index, 'standard') as string;

		if (blockchainType === 'evm') {
			const toAddress = this.getNodeParameter('toAddress', index) as string;
			const value = this.getNodeParameter('value', index) as string;
			const data = this.getNodeParameter('data', index, '') as string;
			const body: IDataObject = {
				extendedPublicKey,
				recipient: toAddress,
				amount: value,
				fee: { priority: feePriority },
			};
			if (data) body.data = data;
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `${basePath}/${encodeURIComponent(extendedPublicKey)}/transactions/prepare`,
				body,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (blockchainType === 'utxo') {
			const recipientsRaw = this.getNodeParameter('recipients', index) as string | object;
			const recipients = typeof recipientsRaw === 'string' ? JSON.parse(recipientsRaw) : recipientsRaw;
			const body: IDataObject = {
				extendedPublicKey,
				recipients,
				fee: { priority: feePriority },
			};
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `${basePath}/${encodeURIComponent(extendedPublicKey)}/transactions/prepare`,
				body,
			});
			return [{ json: unwrapSingleItem(response) }];
		}
	}

	throw new Error(`Unsupported HD Wallet operation: ${operation}`);
}
