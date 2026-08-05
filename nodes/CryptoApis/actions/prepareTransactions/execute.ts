import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { cryptoApisRequest, unwrapSingleItem } from '../../transport/requestHelpers';

/**
 * Read a fixedCollection of {address, amount} rows into the bare array the
 * multi-output (Kaspa/UTXO) endpoints expect.
 *
 * n8n hands a fixedCollection back as `{ recipient: [ {...}, ... ] }`, so the inner
 * key has to be unwrapped. Throws when empty rather than sending an empty array,
 * which the API would reject with a less obvious message.
 */
function collectRecipients(
	this: IExecuteFunctions,
	paramName: string,
	index: number,
): IDataObject[] {
	const param = this.getNodeParameter(paramName, index, {}) as IDataObject;
	const rows = (param.recipient as IDataObject[] | undefined) ?? [];
	if (rows.length === 0) {
		throw new Error('At least one recipient (address + amount) is required');
	}
	return rows.map((r) => ({ address: r.address, amount: r.amount }));
}

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

	if (blockchainType === 'solana') {
		const network = this.getNodeParameter('solanaNetwork', index) as string;
		const body: IDataObject = {
			fromAddress: this.getNodeParameter('solanaFromAddress', index) as string,
			toAddress: this.getNodeParameter('solanaToAddress', index) as string,
			amount: this.getNodeParameter('solanaPrepareAmount', index) as string,
			feeOptions: { priority: this.getNodeParameter('solanaFeePriority', index, 'standard') as string },
		};

		if (operation === 'prepareSolanaNativeCoinTransfer') {
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/prepare-transactions/solana/${network}/native-coins`,
				body,
				resource: 'prepareTransactions',
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		if (operation === 'prepareSplTokenTransfer') {
			body.tokenContract = this.getNodeParameter('solanaMintAddress', index) as string;
			// tokenStandard is deliberately NOT sent. This endpoint rejects EVERY value
			// with invalid_data "Possible values are token, token-2022" — including those
			// two — and only succeeds when the attribute is omitted, in which case it
			// infers the program from the mint. Verified live; filed as a backend bug.
			// (Note the fees endpoint DOES accept it, but only uppercase TOKEN/TOKEN-2022.)
			const response = await cryptoApisRequest.call(this, {
				method: 'POST',
				endpoint: `/prepare-transactions/solana/${network}/spl-tokens`,
				body,
				resource: 'prepareTransactions',
			});
			return [{ json: unwrapSingleItem(response) }];
		}

		throw new Error(`Unsupported Solana Prepare Transactions operation: ${operation}`);
	}

	if (blockchainType === 'xrp') {
		const network = this.getNodeParameter('xrpNetwork', index) as string;
		const body: IDataObject = {
			fromAddress: this.getNodeParameter('xrpFromAddress', index) as string,
			toAddress: this.getNodeParameter('xrpToAddress', index) as string,
			amount: this.getNodeParameter('xrpAmount', index) as string,
			feeOptions: { priority: this.getNodeParameter('xrpFeePriority', index, 'standard') as string },
		};
		const destinationTag = this.getNodeParameter('xrpDestinationTag', index, '') as string;
		if (destinationTag) body.destinationTag = destinationTag;
		const sequence = this.getNodeParameter('xrpSequence', index, '') as string;
		if (sequence) body.sequence = sequence;

		const response = await cryptoApisRequest.call(this, {
			method: 'POST',
			endpoint: `/prepare-transactions/xrp/${network}/native-coins`,
			body,
			resource: 'prepareTransactions',
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (blockchainType === 'kaspa') {
		const network = this.getNodeParameter('kaspaNetwork', index) as string;
		const body: IDataObject = {
			fromAddress: this.getNodeParameter('kaspaFromAddress', index) as string,
			recipients: collectRecipients.call(this, 'kaspaRecipients', index),
			feeOptions: { priority: this.getNodeParameter('kaspaFeePriority', index, 'standard') as string },
		};

		const response = await cryptoApisRequest.call(this, {
			method: 'POST',
			endpoint: `/prepare-transactions/kaspa/${network}/native-coins`,
			body,
			resource: 'prepareTransactions',
		});
		return [{ json: unwrapSingleItem(response) }];
	}

	if (blockchainType === 'utxo') {
		// The only new family whose path carries a {blockchain} segment.
		const utxoBlockchain = this.getNodeParameter('utxoBlockchain', index) as string;
		const network = this.getNodeParameter('utxoNetwork', index) as string;
		const body: IDataObject = {
			fromAddress: this.getNodeParameter('utxoFromAddress', index) as string,
			recipients: collectRecipients.call(this, 'utxoRecipients', index),
			feeOptions: { priority: this.getNodeParameter('utxoFeePriority', index, 'standard') as string },
		};
		const prepareStrategy = this.getNodeParameter('utxoPrepareStrategy', index, 'none') as string;
		if (prepareStrategy !== 'none') body.prepareStrategy = prepareStrategy;
		const replaceable = this.getNodeParameter('utxoReplaceable', index, false) as boolean;
		if (replaceable) body.replaceable = replaceable;

		const response = await cryptoApisRequest.call(this, {
			method: 'POST',
			endpoint: `/prepare-transactions/utxo/${utxoBlockchain}/${network}/native-coins`,
			body,
			resource: 'prepareTransactions',
		});
		return [{ json: unwrapSingleItem(response) }];
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
