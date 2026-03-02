import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { cryptoApisRequest, unwrapSingleItem } from '../../transport/requestHelpers';

export async function executeContracts(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const blockchainType = this.getNodeParameter('blockchainType', index) as string;
	const contractAddress = this.getNodeParameter('contractAddress', index) as string;
	const network = this.getNodeParameter('network', index) as string;

	if (blockchainType === 'evm') {
		const blockchain = this.getNodeParameter('blockchain', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `/smart-contracts/evm/${blockchain}/${network}/${encodeURIComponent(contractAddress)}/token-data`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (blockchainType === 'solana') {
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `/smart-contracts/solana/${network}/${encodeURIComponent(contractAddress)}/token-data`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	throw new Error(`Unsupported Contracts blockchain type: ${blockchainType}`);
}
