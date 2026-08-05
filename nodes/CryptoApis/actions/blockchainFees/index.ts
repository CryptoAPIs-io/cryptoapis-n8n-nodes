import type { INodeProperties } from 'n8n-workflow';
import { blockchainOptions, networkOptions, XRP_NETWORKS, TEZOS_NETWORKS, SOLANA_NETWORKS } from '../../transport/blockchainConstants';
import {
	EVM_MEMPOOL_BLOCKCHAINS,
	EVM_MEMPOOL_NETWORKS,
	EVM_EIP1559_BLOCKCHAINS,
	EVM_EIP1559_NETWORKS,
	EVM_NATIVE_COIN_GAS_BLOCKCHAINS,
	EVM_NATIVE_COIN_GAS_NETWORKS,
	EVM_TOKEN_GAS_BLOCKCHAINS,
	EVM_TOKEN_GAS_NETWORKS,
	EVM_CONTRACT_GAS_BLOCKCHAINS,
	EVM_CONTRACT_GAS_NETWORKS,
	UTXO_MEMPOOL_BLOCKCHAINS,
	UTXO_MEMPOOL_NETWORKS,
	UTXO_SMART_FEE_BLOCKCHAINS,
	UTXO_SMART_FEE_NETWORKS,
} from './blockchainEnums';

export const blockchainFeesOperations: INodeProperties[] = [
	{
		displayName: 'Blockchain Type',
		name: 'blockchainType',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['blockchainFees'] } },
		options: [
			{ name: 'EVM', value: 'evm' },
			{ name: 'Solana', value: 'solana' },
			{ name: 'Tezos', value: 'tezos' },
			{ name: 'UTXO', value: 'utxo' },
			{ name: 'XRP', value: 'xrp' },
		],
		default: 'evm',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['blockchainFees'] } },
		options: [
			{ name: 'Estimate Contract Interaction Gas', value: 'estimateContractInteractionGas', description: 'Estimate gas for a contract interaction using calldata (EVM only)', action: 'Estimate gas for a contract interaction' },
			{ name: 'Estimate FA1.2 Transfer Fee', value: 'estimateFa12TransferFee', description: 'Estimate the fee for an FA1.2 token transfer (Tezos only)', action: 'Estimate the fee for an FA1.2 token transfer' },
			{ name: 'Estimate FA2 Transfer Fee', value: 'estimateFa2TransferFee', description: 'Estimate the fee for an FA2 token transfer (Tezos only)', action: 'Estimate the fee for an FA2 token transfer' },
			{ name: 'Estimate Native Coin Transfer Compute Units', value: 'estimateNativeCoinTransferComputeUnits', description: 'Estimate compute units for a native SOL transfer (Solana only)', action: 'Estimate compute units for a native SOL transfer' },
			{ name: 'Estimate Native Coin Transfer Gas', value: 'estimateNativeCoinTransferGas', description: 'Estimate gas for a native coin transfer (EVM only)', action: 'Estimate gas for a native coin transfer' },
			{ name: 'Estimate Program Invocation Compute Units', value: 'estimateProgramInvocationComputeUnits', description: 'Estimate compute units for invoking a Solana program (Solana only)', action: 'Estimate compute units for a program invocation' },
			{ name: 'Estimate Token Transfer Compute Units', value: 'estimateTokenTransferComputeUnits', description: 'Estimate compute units for an SPL token transfer (Solana only)', action: 'Estimate compute units for an SPL token transfer' },
			{ name: 'Estimate Token Transfer Gas', value: 'estimateTokenTransferGas', description: 'Estimate gas for a token transfer — ERC-20/ERC-721 (EVM only)', action: 'Estimate gas for a token transfer (ERC-20/ERC-721)' },
			{ name: 'Estimate Transaction Smart Fee', value: 'estimateTransactionSmartFee', description: 'Estimate smart fee for a UTXO transaction with confirmation target (UTXO only)', action: 'Estimate smart fee for a UTXO transaction' },
			{ name: 'Estimate Transfer Fee', value: 'estimateTransferFee', description: 'Estimate the fee for a native XTZ transfer (Tezos only)', action: 'Estimate the fee for a native XTZ transfer' },
			{ name: 'Get EIP-1559 Fee Recommendations', value: 'getEip1559FeeRecommendations', description: 'Get EIP-1559 fee recommendations — base fee + priority fee (EVM only)', action: 'Get base and priority fee recommendations' },
			{ name: 'Get Fee Recommendations', value: 'getFeeRecommendations', description: 'Get mempool fee recommendations (all blockchain types)', action: 'Get mempool fee recommendations' },
		],
		default: 'getFeeRecommendations',
	},
];

export const blockchainFeesFields: INodeProperties[] = [
	// Blockchain/Network (EVM) — per-operation enums, since support genuinely differs:
	// contract-interaction gas EXCLUDES ethereum/ethereum-classic/binance-smart-chain entirely,
	// eip-1559 only exists for 5 of 9 chains, mempool excludes tron (dedicated path).
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_MEMPOOL_BLOCKCHAINS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['getFeeRecommendations'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_MEMPOOL_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['getFeeRecommendations'] } },
	},
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_EIP1559_BLOCKCHAINS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['getEip1559FeeRecommendations'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_EIP1559_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['getEip1559FeeRecommendations'] } },
	},
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_NATIVE_COIN_GAS_BLOCKCHAINS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['estimateNativeCoinTransferGas'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_NATIVE_COIN_GAS_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['estimateNativeCoinTransferGas'] } },
	},
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'ethereum',
		options: blockchainOptions(EVM_TOKEN_GAS_BLOCKCHAINS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['estimateTokenTransferGas'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_TOKEN_GAS_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['estimateTokenTransferGas'] } },
	},
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'arbitrum',
		options: blockchainOptions(EVM_CONTRACT_GAS_BLOCKCHAINS),
		description: 'Not supported on ethereum, ethereum-classic, or binance-smart-chain per the spec',
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['estimateContractInteractionGas'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(EVM_CONTRACT_GAS_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['evm'], operation: ['estimateContractInteractionGas'] } },
	},
	// Blockchain/Network (UTXO)
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(UTXO_MEMPOOL_BLOCKCHAINS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['utxo'], operation: ['getFeeRecommendations'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(UTXO_MEMPOOL_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['utxo'], operation: ['getFeeRecommendations'] } },
	},
	{
		displayName: 'Blockchain',
		name: 'blockchain',
		type: 'options',
		required: true,
		default: 'bitcoin',
		options: blockchainOptions(UTXO_SMART_FEE_BLOCKCHAINS),
		description: 'Not supported on bitcoin-cash, dogecoin, or zcash per the spec',
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['utxo'], operation: ['estimateTransactionSmartFee'] } },
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(UTXO_SMART_FEE_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['utxo'], operation: ['estimateTransactionSmartFee'] } },
	},
	// Network (XRP)
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(XRP_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['xrp'] } },
	},

	// Network (Tezos) — like XRP, the path carries no separate blockchain segment
	// (/blockchain-fees/tezos/{network}/...), so blockchainType IS the chain.
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(TEZOS_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['tezos'] } },
	},

	// --- Tezos fee-estimate fields ---
	// Shared by all three estimate operations. `senderPublicKey` is optional: the API
	// needs it only when the sender account is still unrevealed on-chain, in which case
	// the reveal operation's cost is included in the estimate.
	{
		displayName: 'Sender',
		name: 'tezosSender',
		type: 'string',
		required: true,
		default: '',
		description: 'The address sending the funds',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['tezos'],
				operation: ['estimateTransferFee', 'estimateFa12TransferFee', 'estimateFa2TransferFee'],
			},
		},
	},
	{
		displayName: 'Recipient',
		name: 'tezosRecipient',
		type: 'string',
		required: true,
		default: '',
		description: 'The address receiving the funds',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['tezos'],
				operation: ['estimateTransferFee', 'estimateFa12TransferFee', 'estimateFa2TransferFee'],
			},
		},
	},
	{
		displayName: 'Amount',
		name: 'tezosAmount',
		type: 'string',
		required: true,
		default: '',
		description: 'Amount to transfer, as a decimal string',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['tezos'],
				operation: ['estimateTransferFee', 'estimateFa12TransferFee', 'estimateFa2TransferFee'],
			},
		},
	},
	{
		displayName: 'Contract Address',
		name: 'tezosContractAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'The FA1.2/FA2 token contract address (KT1…)',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['tezos'],
				operation: ['estimateFa12TransferFee', 'estimateFa2TransferFee'],
			},
		},
	},
	{
		displayName: 'Token ID',
		name: 'tezosTokenId',
		type: 'string',
		required: true,
		default: '0',
		// Not a secret — an FA2 token index is public on-chain data. Masked only
		// because n8n-nodes-base/node-param-type-options-password-missing treats
		// any parameter name containing "token" as a credential, and n8n's
		// verification scanner enforces that rule regardless of our eslint config.
		// Renaming the field would clear it properly but silently breaks saved
		// workflows (n8n strips unknown parameter names and substitutes the
		// default), so the mask is the non-breaking option.
		typeOptions: { password: true },
		// String, not number: the API rejects a numeric tokenId with
		// invalid_data "Required value type is string" (verified live).
		description: 'The FA2 token ID within the contract. FA2 contracts can hold many token IDs; FA1.2 cannot, which is why this is FA2-only.',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['tezos'],
				operation: ['estimateFa2TransferFee'],
			},
		},
	},
	{
		displayName: 'Sender Public Key',
		name: 'tezosSenderPublicKey',
		type: 'string',
		default: '',
		description: 'Only needed when the sender account is not yet revealed on-chain — the estimate then includes the reveal cost',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['tezos'],
				operation: ['estimateTransferFee', 'estimateFa12TransferFee', 'estimateFa2TransferFee'],
			},
		},
	},

	// Network (Solana) — path is /blockchain-fees/solana/{network}/..., no blockchain segment.
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		required: true,
		default: 'mainnet',
		options: networkOptions(SOLANA_NETWORKS),
		displayOptions: { show: { resource: ['blockchainFees'], blockchainType: ['solana'] } },
	},

	// --- Solana compute-unit estimate fields ---
	// Solana prices transactions in COMPUTE UNITS rather than a gas price, so these
	// return a unit estimate rather than a fee amount.
	{
		displayName: 'Sender',
		name: 'solanaSender',
		type: 'string',
		required: true,
		default: '',
		description: 'The address sending the funds',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['solana'],
				operation: [
					'estimateNativeCoinTransferComputeUnits',
					'estimateTokenTransferComputeUnits',
					'estimateProgramInvocationComputeUnits',
				],
			},
		},
	},
	{
		displayName: 'Recipient',
		name: 'solanaRecipient',
		type: 'string',
		required: true,
		default: '',
		description: 'The address receiving the funds',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['solana'],
				operation: ['estimateNativeCoinTransferComputeUnits', 'estimateTokenTransferComputeUnits'],
			},
		},
	},
	{
		displayName: 'Amount',
		name: 'solanaAmount',
		type: 'string',
		required: true,
		default: '',
		// The API rejects a decimal here: "Amount must be a non-negative integer string".
		description: 'Amount in the smallest unit as an integer string — lamports for SOL, base units for SPL tokens. Decimals are rejected.',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['solana'],
				operation: ['estimateNativeCoinTransferComputeUnits', 'estimateTokenTransferComputeUnits'],
			},
		},
	},
	{
		displayName: 'Contract Address',
		name: 'solanaContractAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'The SPL token mint address',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['solana'],
				operation: ['estimateTokenTransferComputeUnits'],
			},
		},
	},
	{
		displayName: 'Token Standard',
		name: 'solanaTokenStandard',
		type: 'options',
		required: true,
		default: 'TOKEN',
		description: 'Which SPL token program the mint belongs to — classic TOKEN or TOKEN-2022',
		options: [
			{ name: 'TOKEN', value: 'TOKEN' },
			{ name: 'TOKEN-2022', value: 'TOKEN-2022' },
		],
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['solana'],
				operation: ['estimateTokenTransferComputeUnits'],
			},
		},
	},
	{
		displayName: 'Program ID',
		name: 'solanaProgramId',
		type: 'string',
		required: true,
		default: '',
		description: 'The address of the Solana program being invoked',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['solana'],
				operation: ['estimateProgramInvocationComputeUnits'],
			},
		},
	},
	{
		displayName: 'Instruction Data',
		name: 'solanaInstructionData',
		type: 'string',
		required: true,
		default: '',
		description: 'The instruction payload passed to the program, base58/hex encoded as the program expects',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['solana'],
				operation: ['estimateProgramInvocationComputeUnits'],
			},
		},
	},
	{
		displayName: 'Accounts',
		name: 'solanaAccounts',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		required: true,
		default: {},
		// Required by the API: omitting it returns missing_required_attributes. Note the
		// error names the fields snake_case (accounts.is_signer) but the request body
		// must use camelCase (isSigner) — verified live.
		description: 'The accounts the instruction touches, in the order the program expects them. At least one is required.',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				blockchainType: ['solana'],
				operation: ['estimateProgramInvocationComputeUnits'],
			},
		},
		options: [
			{
				displayName: 'Account',
				name: 'account',
				values: [
					{
						displayName: 'Pubkey',
						name: 'pubkey',
						type: 'string',
						default: '',
						description: 'The account address',
					},
					{
						displayName: 'Is Signer',
						name: 'isSigner',
						type: 'boolean',
						default: false,
						description: 'Whether this account must sign the transaction',
					},
					{
						displayName: 'Is Writable',
						name: 'isWritable',
						type: 'boolean',
						default: false,
						description: 'Whether the instruction may modify this account',
					},
				],
			},
		],
	},

	// --- EVM Estimate Gas fields ---
	{
		displayName: 'From Address',
		name: 'fromAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'Sender address',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateNativeCoinTransferGas', 'estimateTokenTransferGas', 'estimateContractInteractionGas'],
			},
		},
	},
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'Recipient address',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateNativeCoinTransferGas', 'estimateTokenTransferGas'],
			},
		},
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '',
		description: 'Amount to transfer (in native coin smallest unit, e.g. wei). For contract interaction, this is the native coin value sent with the call, e.g. "0".',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateNativeCoinTransferGas', 'estimateContractInteractionGas'],
			},
		},
	},
	// Token transfer fields
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'Token contract address',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateTokenTransferGas', 'estimateContractInteractionGas'],
			},
		},
	},
	{
		displayName: 'Contract Type',
		name: 'contractType',
		type: 'options',
		required: true,
		default: 'ERC-20',
		options: [
			{ name: 'ERC-20', value: 'ERC-20' },
			{ name: 'ERC-721', value: 'ERC-721' },
		],
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateTokenTransferGas'],
			},
		},
	},
	{
		displayName: 'Token Amount',
		name: 'tokenAmount',
		type: 'string',
		required: true,
		default: '',
		// Not a secret; masked to satisfy the "token" name heuristic — see the
		// tezosTokenId field above for why renaming is not the safer option.
		typeOptions: { password: true },
		description: 'Amount of tokens to transfer',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateTokenTransferGas'],
			},
		},
	},
	// Contract interaction fields
	{
		displayName: 'Calldata',
		name: 'data',
		type: 'string',
		required: true,
		default: '',
		description: 'Hex-encoded calldata for the contract interaction',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateContractInteractionGas'],
			},
		},
	},

	// --- UTXO Smart Fee fields ---
	{
		displayName: 'Confirmation Target',
		name: 'confirmationTarget',
		type: 'number',
		typeOptions: { minValue: 1 },
		required: true,
		default: 2,
		description: 'Number of blocks within which the transaction should be confirmed',
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateTransactionSmartFee'],
			},
		},
	},
	{
		displayName: 'Fee Rate Priority',
		name: 'feeRatePriority',
		type: 'options',
		default: 'ECONOMICAL',
		options: [
			{ name: 'Economical', value: 'ECONOMICAL' },
			{ name: 'Conservative', value: 'CONSERVATIVE' },
		],
		displayOptions: {
			show: {
				resource: ['blockchainFees'],
				operation: ['estimateTransactionSmartFee'],
			},
		},
	},
];
