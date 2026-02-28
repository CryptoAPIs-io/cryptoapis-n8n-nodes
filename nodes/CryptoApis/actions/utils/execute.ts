import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { cryptoApisRequest, unwrapSingleItem, unwrapItems } from '../../transport/requestHelpers';

export async function executeUtils(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const blockchainType = this.getNodeParameter('blockchainType', index) as string;
	const operation = this.getNodeParameter('operation', index) as string;

	// --- Derive Addresses (works across EVM, UTXO, XRP) ---
	if (operation === 'deriveAddresses') {
		const blockchain = blockchainType === 'xrp'
			? 'xrp'
			: this.getNodeParameter('blockchain', index) as string;
		const network = this.getNodeParameter('network', index) as string;
		const extendedPublicKey = this.getNodeParameter('extendedPublicKey', index) as string;
		const addressesCount = this.getNodeParameter('addressesCount', index, 1) as number;
		const startIndex = this.getNodeParameter('startIndex', index, 0) as number;
		const addressFormat = this.getNodeParameter('addressFormat', index, '') as string;
		const isChange = this.getNodeParameter('isChange', index, false) as boolean;

		const qs: IDataObject = { addressesCount, startIndex, isChange };
		if (addressFormat) qs.addressFormat = addressFormat;

		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `/utils/${blockchain}/${network}/xpubs/${encodeURIComponent(extendedPublicKey)}/derive-addresses`,
			qs,
		});
		return unwrapItems(response).map((item) => ({ json: item }));
	}

	// --- EVM Utils ---
	if (blockchainType === 'evm') {
		const blockchain = this.getNodeParameter('blockchain', index) as string;
		const network = this.getNodeParameter('network', index) as string;

		if (operation === 'validateAddress') {
			const address = this.getNodeParameter('address', index) as string;
			const response = await cryptoApisRequest.call(this, {
				method: 'GET',
				endpoint: `/utils/evm/${blockchain}/${network}/addresses/${encodeURIComponent(address)}/validate`,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'decodeRawTransaction') {
			const rawTransactionHex = this.getNodeParameter('rawTransactionHex', index) as string;
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/utils/evm/${blockchain}/${network}/decode-raw-transaction`,
				body: { rawTransactionHex } as IDataObject,
			});
			return [{ json: unwrapSingleItem(response) }];
		}
	}

	// --- UTXO Utils ---
	if (blockchainType === 'utxo') {
		const blockchain = this.getNodeParameter('blockchain', index) as string;
		const network = this.getNodeParameter('network', index) as string;

		if (operation === 'validateAddress') {
			const address = this.getNodeParameter('address', index) as string;
			const response = await cryptoApisRequest.call(this, {
				method: 'GET',
				endpoint: `/utils/utxo/${blockchain}/${network}/addresses/${encodeURIComponent(address)}/validate`,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'decodeRawTransaction') {
			const rawTransactionHex = this.getNodeParameter('rawTransactionHex', index) as string;
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/utils/utxo/${blockchain}/${network}/decode-raw-transaction`,
				body: { rawTransactionHex } as IDataObject,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'convertBitcoinCashAddress') {
			const address = this.getNodeParameter('address', index) as string;
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/utils/utxo/bitcoin-cash/${network}/convert-address`,
				body: { address } as IDataObject,
			});
			return [{ json: unwrapSingleItem(response) }];
		}
	}

	// --- XRP Utils ---
	if (blockchainType === 'xrp') {
		const network = this.getNodeParameter('network', index) as string;

		if (operation === 'validateAddress') {
			const address = this.getNodeParameter('address', index) as string;
			const response = await cryptoApisRequest.call(this, {
				method: 'GET',
				endpoint: `/utils/xrp/${network}/${encodeURIComponent(address)}/validate`,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'decodeXAddress') {
			const address = this.getNodeParameter('address', index) as string;
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/utils/xrp/${network}/decode-x-address`,
				body: { address } as IDataObject,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'encodeXAddress') {
			const classicAddress = this.getNodeParameter('classicAddress', index) as string;
			const tag = this.getNodeParameter('tag', index, 0) as number;
			const body: IDataObject = { classicAddress };
			if (tag > 0) body.tag = tag;
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/utils/xrp/${network}/encode-x-address`,
				body,
			});
			return [{ json: unwrapSingleItem(response) }];
		}
	}

	throw new Error(`Unsupported Utils operation: ${operation}`);
}
