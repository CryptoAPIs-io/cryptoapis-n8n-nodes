import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { cryptoApisRequest, unwrapSingleItem } from '../../transport/requestHelpers';

export async function executeBlockchainFees(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const blockchainType = this.getNodeParameter('blockchainType', index) as string;
	const operation = this.getNodeParameter('operation', index) as string;
	const network = this.getNodeParameter('network', index) as string;

	if (blockchainType === 'xrp') {
		// XRP: GET /blockchain-fees/xrp/{network}/mempool
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `/blockchain-fees/xrp/${network}/mempool`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	const blockchain = this.getNodeParameter('blockchain', index) as string;

	if (operation === 'getFeeRecommendations') {
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `/blockchain-fees/${blockchainType}/${blockchain}/${network}/mempool`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'getEip1559FeeRecommendations') {
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `/blockchain-fees/evm/${blockchain}/${network}/mempool-eip1559`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'estimateNativeCoinTransferGas') {
		const fromAddress = this.getNodeParameter('fromAddress', index) as string;
		const toAddress = this.getNodeParameter('toAddress', index) as string;
		const amount = this.getNodeParameter('amount', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'POST',
			endpoint: `/blockchain-fees/evm/${blockchain}/${network}/gas-estimate`,
			body: { sender: fromAddress, recipient: toAddress, amount } as IDataObject,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'estimateTokenTransferGas') {
		const fromAddress = this.getNodeParameter('fromAddress', index) as string;
		const contractAddress = this.getNodeParameter('contractAddress', index) as string;
		const contractType = this.getNodeParameter('contractType', index) as string;
		const tokenAmount = this.getNodeParameter('tokenAmount', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'POST',
			endpoint: `/blockchain-fees/evm/${blockchain}/${network}/gas-estimate`,
			body: {
				sender: fromAddress,
				contractAddress,
				contractType,
				amount: tokenAmount,
			} as IDataObject,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'estimateContractInteractionGas') {
		const fromAddress = this.getNodeParameter('fromAddress', index) as string;
		const contractAddress = this.getNodeParameter('contractAddress', index) as string;
		const data = this.getNodeParameter('data', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'POST',
			endpoint: `/blockchain-fees/evm/${blockchain}/${network}/gas-estimate`,
			body: { sender: fromAddress, contractAddress, data } as IDataObject,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'estimateTransactionSmartFee') {
		const confirmationTarget = this.getNodeParameter('confirmationTarget', index) as number;
		const feeRatePriority = this.getNodeParameter('feeRatePriority', index) as string;
		const response = await cryptoApisRequest.call(this, {
			method: 'GET',
			endpoint: `/blockchain-fees/utxo/${blockchain}/${network}/smart-fee`,
			qs: { confirmationTarget, feeRatePriority } as IDataObject,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	throw new Error(`Unsupported Blockchain Fees operation: ${operation}`);
}
