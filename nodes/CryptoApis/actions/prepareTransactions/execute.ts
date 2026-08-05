import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { cryptoApisRequest, unwrapSingleItem } from '../../transport/requestHelpers';

export async function executePrepareTransactions(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	// Default to 'evm' so workflows saved before this selector existed keep their old
	// behaviour instead of failing on a missing parameter.
	const blockchainType = this.getNodeParameter('blockchainType', index, 'evm') as string;

	// Tezos must be handled BEFORE the EVM parameter reads below: its path carries no
	// blockchain segment (/prepare-transactions/tezos/{network}/...) and it uses its own
	// field set, so the EVM-gated fields do not exist on the node for this branch.
	if (blockchainType === 'tezos') {
		const network = this.getNodeParameter('tezosNetwork', index) as string;
		const fromAddress = this.getNodeParameter('tezosFromAddress', index) as string;
		const toAddress = this.getNodeParameter('tezosToAddress', index) as string;
		const amount = this.getNodeParameter('tezosPrepareAmount', index) as string;
		const fromPublicKey = this.getNodeParameter('tezosFromPublicKey', index, '') as string;
		const feePriority = this.getNodeParameter('tezosFeePriority', index, 'standard') as string;

		// Tezos nests the priority under feeOptions (not `fee`, as EVM does).
		const body: IDataObject = {
			fromAddress,
			toAddress,
			amount,
			feeOptions: { priority: feePriority },
		};
		if (fromPublicKey) body.fromPublicKey = fromPublicKey;

		if (operation === 'prepareTezosNativeCoinTransfer') {
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/prepare-transactions/tezos/${network}/native-coins`,
				body,
				resource: 'prepareTransactions',
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'prepareFa12TokenTransfer') {
			body.contractAddress = this.getNodeParameter('tezosPrepareContractAddress', index) as string;
			// tokenStandard is a required literal on these endpoints, not a user choice.
			body.tokenStandard = 'FA_1_2';
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/prepare-transactions/tezos/${network}/fa1-2-tokens`,
				body,
				resource: 'prepareTransactions',
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'prepareFa2TokenTransfer') {
			body.contractAddress = this.getNodeParameter('tezosPrepareContractAddress', index) as string;
			body.tokenId = this.getNodeParameter('tezosPrepareTokenId', index) as string;
			body.tokenStandard = 'FA_2';
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/prepare-transactions/tezos/${network}/fa2-tokens`,
				body,
				resource: 'prepareTransactions',
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		throw new Error(`Unsupported Tezos Prepare Transactions operation: ${operation}`);
	}

	const blockchain = this.getNodeParameter('blockchain', index) as string;
	const network = this.getNodeParameter('network', index) as string;
	const fromAddress = this.getNodeParameter('fromAddress', index) as string;
	const toAddress = this.getNodeParameter('toAddress', index) as string;
	const feePriority = this.getNodeParameter('feePriority', index, 'standard') as string;
	const gasLimit = this.getNodeParameter('gasLimit', index, '') as string;
	const gasPrice = this.getNodeParameter('gasPrice', index, '') as string;

	// Tron has 3 dedicated endpoints (/prepare-transactions/evm/tron/{network}/...) with a
	// simpler body shape -- no fee.priority/gasLimit/gasPrice, and a token-transfer path segment
	// (trc20-tokens) that differs from the generic fungible-tokens. The generic path's blockchain
	// enum explicitly excludes tron, so it must always route here, never through the generic path.
	if (blockchain === 'tron') {
		if (operation === 'prepareNativeCoinTransfer') {
			const amount = this.getNodeParameter('amount', index) as string;
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/prepare-transactions/evm/tron/${network}/native-coins`,
				body: { sender: fromAddress, recipient: toAddress, amount } as IDataObject,
				resource: 'prepareTransactions',
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'prepareFungibleTokenTransfer') {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const tokenAmount = this.getNodeParameter('tokenAmount', index) as string;
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/prepare-transactions/evm/tron/${network}/trc20-tokens`,
				body: { sender: fromAddress, recipient: toAddress, contract: contractAddress, amount: tokenAmount } as IDataObject,
				resource: 'prepareTransactions',
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'prepareNftTransfer') {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/prepare-transactions/evm/tron/${network}/non-fungible-tokens`,
				body: { sender: fromAddress, recipient: toAddress, contract: contractAddress, tokenId } as IDataObject,
				resource: 'prepareTransactions',
			});
			return [{ json: unwrapSingleItem(response) }];
		}
	}

	const basePath = `/prepare-transactions/evm/${blockchain}/${network}`;

	if (operation === 'prepareNativeCoinTransfer') {
		const amount = this.getNodeParameter('amount', index) as string;
		const body: IDataObject = {
			sender: fromAddress,
			recipient: toAddress,
			amount,
			fee: { priority: feePriority },
		};
		if (gasLimit) body.gasLimit = gasLimit;
		if (gasPrice) body.gasPrice = gasPrice;
		const response = await cryptoApisRequest.call(this, {
			method: 'POST',
			endpoint: `${basePath}/native-coins`,
			body,
			resource: 'prepareTransactions',
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'prepareFungibleTokenTransfer') {
		// Spec body field is "contract", not "contractAddress" -- was wrong for every EVM chain,
		// not just tron (confirmed live: ethereum mainnet rejects contractAddress with
		// missing_required_attributes on "contract").
		const contractAddress = this.getNodeParameter('contractAddress', index) as string;
		const tokenAmount = this.getNodeParameter('tokenAmount', index) as string;
		const body: IDataObject = {
			sender: fromAddress,
			recipient: toAddress,
			contract: contractAddress,
			amount: tokenAmount,
			fee: { priority: feePriority },
		};
		if (gasLimit) body.gasLimit = gasLimit;
		if (gasPrice) body.gasPrice = gasPrice;
		const response = await cryptoApisRequest.call(this, {
			method: 'POST',
			endpoint: `${basePath}/fungible-tokens`,
			body,
			resource: 'prepareTransactions',
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (operation === 'prepareNftTransfer') {
		// Spec body field is "contract", not "contractAddress" -- same fix as fungible-tokens above.
		const contractAddress = this.getNodeParameter('contractAddress', index) as string;
		const tokenId = this.getNodeParameter('tokenId', index) as string;
		const body: IDataObject = {
			sender: fromAddress,
			recipient: toAddress,
			contract: contractAddress,
			tokenId,
			fee: { priority: feePriority },
		};
		if (gasLimit) body.gasLimit = gasLimit;
		if (gasPrice) body.gasPrice = gasPrice;
		const response = await cryptoApisRequest.call(this, {
			method: 'POST',
			endpoint: `${basePath}/non-fungible-tokens`,
			body,
			resource: 'prepareTransactions',
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	throw new Error(`Unsupported Prepare Transactions operation: ${operation}`);
}
