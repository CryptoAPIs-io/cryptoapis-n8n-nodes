import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { cryptoApisRequest, type CryptoApisRequestOptions } from './requestHelpers';

/**
 * Auto-paginate using offset pagination.
 * Returns all items when returnAll=true, otherwise respects limit.
 */
export async function handleOffsetPagination(
	this: IExecuteFunctions,
	baseOptions: CryptoApisRequestOptions,
	returnAll: boolean,
	limit: number,
): Promise<IDataObject[]> {
	const allItems: IDataObject[] = [];
	const pageSize = returnAll ? 50 : Math.min(limit, 50);
	let offset = 0;

	do {
		const qs = { ...baseOptions.qs, limit: pageSize, offset };
		const response = await cryptoApisRequest.call(this, { ...baseOptions, qs });
		const data = response.data as IDataObject | undefined;
		const items = (data?.items as IDataObject[]) ?? [];
		allItems.push(...items);

		if (items.length < pageSize) break;
		offset += pageSize;
		if (!returnAll && allItems.length >= limit) break;
	} while (returnAll || allItems.length < limit);

	return returnAll ? allItems : allItems.slice(0, limit);
}

/**
 * Auto-paginate using cursor pagination (startingAfter).
 * Returns all items when returnAll=true, otherwise respects limit.
 */
export async function handleCursorPagination(
	this: IExecuteFunctions,
	baseOptions: CryptoApisRequestOptions,
	returnAll: boolean,
	limit: number,
): Promise<IDataObject[]> {
	const allItems: IDataObject[] = [];
	const pageSize = returnAll ? 50 : Math.min(limit, 50);
	let startingAfter: string | undefined;

	do {
		const qs: IDataObject = { ...baseOptions.qs, limit: pageSize };
		if (startingAfter) {
			qs.startingAfter = startingAfter;
		}
		const response = await cryptoApisRequest.call(this, { ...baseOptions, qs });
		const data = response.data as IDataObject | undefined;
		const items = (data?.items as IDataObject[]) ?? [];
		allItems.push(...items);

		// Get next cursor
		const meta = response.meta as IDataObject | undefined;
		const cursors = meta?.cursors as IDataObject | undefined;
		startingAfter = cursors?.nextStartingAfter as string | undefined;

		if (!startingAfter || items.length < pageSize) break;
		if (!returnAll && allItems.length >= limit) break;
	} while (returnAll || allItems.length < limit);

	return returnAll ? allItems : allItems.slice(0, limit);
}
