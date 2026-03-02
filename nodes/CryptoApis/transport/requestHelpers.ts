import type {
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

const DEFAULT_BASE_URL = 'https://rest.cryptoapis.io';

export interface CryptoApisRequestOptions {
	method: IHttpRequestMethods;
	endpoint: string;
	body?: IDataObject;
	qs?: IDataObject;
}

/**
 * Make an authenticated request to the Crypto APIs REST API.
 * Wraps POST/PUT body in { data: { item: { ... } } } automatically.
 * Uses the API URL from credentials if set, otherwise falls back to default.
 */
export async function cryptoApisRequest(
	this: IExecuteFunctions,
	options: CryptoApisRequestOptions,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('cryptoApisApi');
	const baseUrl = (credentials.apiUrl as string) || DEFAULT_BASE_URL;

	const requestOptions: IHttpRequestOptions = {
		method: options.method,
		url: `${baseUrl}${options.endpoint}`,
		json: true,
	};

	if (options.qs && Object.keys(options.qs).length > 0) {
		requestOptions.qs = options.qs;
	}

	if (options.body && Object.keys(options.body).length > 0
		&& (options.method === 'POST' || options.method === 'PUT')) {
		requestOptions.body = {
			data: {
				item: options.body,
			},
		};
	}

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'cryptoApisApi',
			requestOptions,
		);
		return response as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Unwrap CryptoAPIs response: extracts data.item (single) or data.items (list).
 */
export function unwrapResponse(response: IDataObject): IDataObject | IDataObject[] {
	const data = response.data as IDataObject | undefined;
	if (!data) return response;
	if (data.item) return data.item as IDataObject;
	if (data.items) return data.items as IDataObject[];
	return data;
}

/**
 * Unwrap response and return a single item.
 */
export function unwrapSingleItem(response: IDataObject): IDataObject {
	const result = unwrapResponse(response);
	if (Array.isArray(result)) return result[0] ?? {};
	return result;
}

/**
 * Unwrap response and return items array.
 */
export function unwrapItems(response: IDataObject): IDataObject[] {
	const result = unwrapResponse(response);
	if (Array.isArray(result)) return result;
	return [result];
}
