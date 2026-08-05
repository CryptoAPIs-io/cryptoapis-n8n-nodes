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
			resource: 'utils',
		});
		return unwrapItems(response).map((item) => ({ json: item }));
	}

	// --- EVM Utils ---
	if (blockchainType === 'evm') {
		const blockchain = this.getNodeParameter('blockchain', index) as string;
		const network = this.getNodeParameter('network', index) as string;

		if (operation === 'validateAddress') {
			// Spec is POST with address in the body, not GET with address in the path.
			const address = this.getNodeParameter('address', index) as string;
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/utils/evm/${blockchain}/${network}/validate-address`,
				body: { address } as IDataObject,
				resource: 'utils',
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'decodeRawTransaction') {
			const rawTransactionHex = this.getNodeParameter('rawTransactionHex', index) as string;
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/utils/evm/${blockchain}/${network}/decode-raw-transaction`,
				body: { rawTransactionHex } as IDataObject,
				resource: 'utils',
			});
			return [{ json: unwrapSingleItem(response) }];
		}
	}

	// --- UTXO Utils ---
	if (blockchainType === 'utxo') {
		const blockchain = this.getNodeParameter('blockchain', index) as string;
		const network = this.getNodeParameter('network', index) as string;

		if (operation === 'validateAddress') {
			// Spec is POST with address in the body, not GET with address in the path.
			const address = this.getNodeParameter('address', index) as string;
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/utils/utxo/${blockchain}/${network}/validate-address`,
				body: { address } as IDataObject,
				resource: 'utils',
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'decodeRawTransaction') {
			const rawTransactionHex = this.getNodeParameter('rawTransactionHex', index) as string;
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/utils/utxo/${blockchain}/${network}/decode-raw-transaction`,
				body: { rawTransactionHex } as IDataObject,
				resource: 'utils',
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'convertBitcoinCashAddress') {
			// Spec path has no utxo/ prefix — /utils/bitcoin-cash/..., not /utils/utxo/bitcoin-cash/....
			const address = this.getNodeParameter('address', index) as string;
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/utils/bitcoin-cash/${network}/convert-address`,
				body: { address } as IDataObject,
				resource: 'utils',
			});
			return [{ json: unwrapSingleItem(response) }];
		}
	}

	// --- XRP Utils ---
	if (blockchainType === 'xrp') {
		const network = this.getNodeParameter('network', index) as string;

		if (operation === 'validateAddress') {
			// Spec is POST /utils/xrp/{blockchain}/{network}/validate-address with address in the
			// body, not GET with the address as a path segment. blockchain is always literal "xrp".
			const address = this.getNodeParameter('address', index) as string;
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/utils/xrp/xrp/${network}/validate-address`,
				body: { address } as IDataObject,
				resource: 'utils',
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'decodeXAddress') {
			// Spec is GET /utils/{blockchain}/{network}/decode-x-address/{xAddress} — a required
			// {blockchain} segment (literal "xrp") and the address as a path segment, not a POST body.
			const address = this.getNodeParameter('address', index) as string;
			const response = await cryptoApisRequest.call(this, {
				method: 'GET',
				endpoint: `/utils/xrp/${network}/decode-x-address/${encodeURIComponent(address)}`,
				resource: 'utils',
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'encodeXAddress') {
			// Spec is GET /utils/{blockchain}/{network}/encode-x-address/{classicAddress}/{addressTag}
			// — both classicAddress and addressTag are required path segments, not an optional POST body.
			const classicAddress = this.getNodeParameter('classicAddress', index) as string;
			const tag = this.getNodeParameter('tag', index, 0) as number;
			const response = await cryptoApisRequest.call(this, {
				method: 'GET',
				endpoint: `/utils/xrp/${network}/encode-x-address/${encodeURIComponent(classicAddress)}/${tag}`,
				resource: 'utils',
			});
			return [{ json: unwrapSingleItem(response) }];
		}
	}

	throw new Error(`Unsupported Utils operation: ${operation}`);
}
