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
			resource: 'blockchainFees',
			method: 'GET',
			endpoint: `/blockchain-fees/xrp/${network}/mempool`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (blockchainType === 'tezos') {
		// Like XRP, the Tezos paths carry no blockchain segment:
		// /blockchain-fees/tezos/{network}/... — so blockchainType IS the chain.
		if (operation === 'getFeeRecommendations') {
			const response = await cryptoApisRequest.call(this, {
				resource: 'blockchainFees',
				method: 'GET',
				endpoint: `/blockchain-fees/tezos/${network}/mempool`,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		// The three estimate operations share sender/recipient/amount; senderPublicKey is
		// optional and only matters for an unrevealed sender (adds the reveal cost).
		const sender = this.getNodeParameter('tezosSender', index) as string;
		const recipient = this.getNodeParameter('tezosRecipient', index) as string;
		const amount = this.getNodeParameter('tezosAmount', index) as string;
		const senderPublicKey = this.getNodeParameter('tezosSenderPublicKey', index, '') as string;

		const body: IDataObject = { sender, recipient, amount };
		if (senderPublicKey) {
			body.senderPublicKey = senderPublicKey;
		}

		if (operation === 'estimateTransferFee') {
			const response = await cryptoApisRequest.call(this, {
				resource: 'blockchainFees',
				method: 'POST',
				endpoint: `/blockchain-fees/tezos/${network}/estimate-transfer`,
				body,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'estimateFa12TransferFee') {
			body.contractAddress = this.getNodeParameter('tezosContractAddress', index) as string;
			const response = await cryptoApisRequest.call(this, {
				resource: 'blockchainFees',
				method: 'POST',
				endpoint: `/blockchain-fees/tezos/${network}/estimate-fa12-transfer`,
				body,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'estimateFa2TransferFee') {
			body.contractAddress = this.getNodeParameter('tezosContractAddress', index) as string;
			body.tokenId = this.getNodeParameter('tezosTokenId', index) as string;
			const response = await cryptoApisRequest.call(this, {
				resource: 'blockchainFees',
				method: 'POST',
				endpoint: `/blockchain-fees/tezos/${network}/estimate-fa2-transfer`,
				body,
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		throw new Error(`Unsupported Tezos Blockchain Fees operation: ${operation}`);
	}

	const blockchain = this.getNodeParameter('blockchain', index) as string;

	if (operation === 'getFeeRecommendations') {
		const response = await cryptoApisRequest.call(this, {
			resource: 'blockchainFees',
			method: 'GET',
			endpoint: `/blockchain-fees/${blockchainType}/${blockchain}/${network}/mempool`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'getEip1559FeeRecommendations') {
		// Spec segment is eip-1559, not mempool-eip1559.
		const response = await cryptoApisRequest.call(this, {
			resource: 'blockchainFees',
			method: 'GET',
			endpoint: `/blockchain-fees/evm/${blockchain}/${network}/eip-1559`,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'estimateNativeCoinTransferGas') {
		// Spec has 3 DISTINCT endpoints, not one generic gas-estimate -- this one is
		// estimate-native-coin-transfer-gas-limit, body { sender, recipient, amount }.
		const fromAddress = this.getNodeParameter('fromAddress', index) as string;
		const toAddress = this.getNodeParameter('toAddress', index) as string;
		const amount = this.getNodeParameter('amount', index) as string;
		const response = await cryptoApisRequest.call(this, {
			resource: 'blockchainFees',
			method: 'POST',
			endpoint: `/blockchain-fees/evm/${blockchain}/${network}/estimate-native-coin-transfer-gas-limit`,
			body: { sender: fromAddress, recipient: toAddress, amount } as IDataObject,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'estimateTokenTransferGas') {
		// Spec path is estimate-token-transfer-gas-limit; body field is "contract", not
		// "contractAddress", and "recipient" is required (was missing entirely).
		const fromAddress = this.getNodeParameter('fromAddress', index) as string;
		const toAddress = this.getNodeParameter('toAddress', index) as string;
		const contractAddress = this.getNodeParameter('contractAddress', index) as string;
		const contractType = this.getNodeParameter('contractType', index) as string;
		const tokenAmount = this.getNodeParameter('tokenAmount', index) as string;
		const response = await cryptoApisRequest.call(this, {
			resource: 'blockchainFees',
			method: 'POST',
			endpoint: `/blockchain-fees/evm/${blockchain}/${network}/estimate-token-transfer-gas-limit`,
			body: {
				sender: fromAddress,
				recipient: toAddress,
				contract: contractAddress,
				contractType,
				amount: tokenAmount,
			} as IDataObject,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'estimateContractInteractionGas') {
		// Spec path is estimate-contract-interaction-gas-limit; body is { sender, recipient,
		// amount, inputData } -- the contract address is "recipient" (was "contractAddress",
		// dropped entirely), "data" is "inputData", and "amount" is required (was missing).
		const fromAddress = this.getNodeParameter('fromAddress', index) as string;
		const contractAddress = this.getNodeParameter('contractAddress', index) as string;
		const amount = this.getNodeParameter('amount', index, '0') as string;
		const data = this.getNodeParameter('data', index) as string;
		const response = await cryptoApisRequest.call(this, {
			resource: 'blockchainFees',
			method: 'POST',
			endpoint: `/blockchain-fees/evm/${blockchain}/${network}/estimate-contract-interaction-gas-limit`,
			body: { sender: fromAddress, recipient: contractAddress, amount, inputData: data } as IDataObject,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'estimateTransactionSmartFee') {
		// Spec segment is smart, not smart-fee. Query param is estimateMode (lowercase
		// economical/conservative values), not feeRatePriority (was ECONOMICAL/CONSERVATIVE).
		const confirmationTarget = this.getNodeParameter('confirmationTarget', index) as number;
		const feeRatePriority = this.getNodeParameter('feeRatePriority', index) as string;
		const response = await cryptoApisRequest.call(this, {
			resource: 'blockchainFees',
			method: 'GET',
			endpoint: `/blockchain-fees/utxo/${blockchain}/${network}/smart`,
			qs: { confirmationTarget, estimateMode: feeRatePriority.toLowerCase() } as IDataObject,
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	throw new Error(`Unsupported Blockchain Fees operation: ${operation}`);
}
