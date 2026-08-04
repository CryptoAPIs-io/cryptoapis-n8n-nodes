import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { cryptoApisRequest, unwrapSingleItem } from '../../transport/requestHelpers';
import { handleOffsetPagination } from '../../transport/paginationHelpers';

export async function executeMarketData(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;

	if (operation === 'getAssetDetailsById') {
		const assetId = this.getNodeParameter('assetId', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `/market-data/assets/by-id/${encodeURIComponent(assetId)}`,
			resource: 'marketData',
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'getAssetDetailsBySymbol') {
		// Spec path is a single combined symbol segment (e.g. "BTC"), not two separate
		// from/to segments -- this was copy-pasted from the exchange-rate-by-symbols shape,
		// which genuinely does take a pair, but asset lookup by symbol does not.
		const assetSymbol = this.getNodeParameter('assetSymbol', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `/market-data/assets/by-symbol/${encodeURIComponent(assetSymbol)}`,
			resource: 'marketData',
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'getExchangeRateBySymbols') {
		const fromSymbol = this.getNodeParameter('fromSymbol', index) as string;
		const toSymbol = this.getNodeParameter('toSymbol', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `/market-data/exchange-rates/by-symbol/${encodeURIComponent(fromSymbol)}/${encodeURIComponent(toSymbol)}`,
			resource: 'marketData',
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'getExchangeRateByIds') {
		const fromAssetId = this.getNodeParameter('fromAssetId', index) as string;
		const toAssetId = this.getNodeParameter('toAssetId', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `/market-data/exchange-rates/by-id/${encodeURIComponent(fromAssetId)}/${encodeURIComponent(toAssetId)}`,
			resource: 'marketData',
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'listSupportedAssets') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const limit = returnAll ? 0 : (this.getNodeParameter('limit', index) as number);
		const assetType = this.getNodeParameter('assetType', index) as string;

		const qs: IDataObject = {};
		if (assetType) qs.type = assetType;

		const items = await handleOffsetPagination.call(
			this,
			{ method: 'GET', endpoint: '/market-data/metadata/assets', qs, resource: 'marketData' },
			returnAll,
			limit,
		);
		return items.map((item) => ({ json: item }));
	}

	throw new Error(`Unsupported Market Data operation: ${operation}`);
}
