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
	resource?: string;
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

	// Convert camelCase resource to kebab-case for x-source header
	const source = options.resource
		? `n8n-${options.resource.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`
		: 'n8n-unknown';

	const requestOptions: IHttpRequestOptions = {
		method: options.method,
		url: `${baseUrl}${options.endpoint}`,
		headers: {
			'x-source': source,
		},
		json: true,
	};

	if (options.qs && Object.keys(options.qs).length > 0) {
		requestOptions.qs = options.qs;
	}

	// Wrap whenever the caller passed a body object at all — including an empty one ({}). Some
	// endpoints (e.g. activate) require the { data: { item: {} } } wrapper with no fields inside it;
	// gating on Object.keys(...).length > 0 previously meant those calls sent no body at all and
	// failed with unsupported_media_type instead of reaching the API. Omit `body` entirely (undefined)
	// for calls that genuinely send none.
	if (options.body !== undefined && (options.method === 'POST' || options.method === 'PUT')) {
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
