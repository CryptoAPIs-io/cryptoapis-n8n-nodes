/**
 * Enum drift guard (BL-0163).
 *
 * The API declares blockchain/network support PER ENDPOINT, not globally: three
 * endpoints in the same product can accept 2, 5 and 9 chains respectively. The node
 * therefore hand-maintains per-operation enums, and those can silently drift from the
 * API in either direction — offering a chain that gets rejected, or hiding one that works.
 *
 * This script fetches the published OpenAPI document and compares every enum declared in
 * a `blockchainEnums.ts` mapping below against the spec, reporting both directions.
 *
 * Usage:
 *   node scripts/check-enum-drift.mjs            # fetch the live spec
 *   node scripts/check-enum-drift.mjs path.json  # use a local spec file
 *
 * Exit code is the number of drifted enums, so CI can gate on it.
 */

import { readFileSync } from 'node:fs';

const SPEC_URL = 'https://developers.cryptoapis.io/openapi.json';

/**
 * Each entry ties one exported enum to the spec parameter that defines it.
 * `param` is 'blockchain' or 'network'; `method` is the HTTP verb on that path.
 */
const MAPPINGS = [
	// addressHistory
	{ file: 'addressHistory', name: 'EVM_STATISTICS_BLOCKCHAINS', path: '/addresses-historical/evm/{blockchain}/{network}/{address}/statistics', method: 'get', param: 'blockchain' },
	{ file: 'addressHistory', name: 'EVM_STATISTICS_NETWORKS', path: '/addresses-historical/evm/{blockchain}/{network}/{address}/statistics', method: 'get', param: 'network' },
	{ file: 'addressHistory', name: 'EVM_TRANSACTIONS_BLOCKCHAINS', path: '/addresses-historical/evm/{blockchain}/{network}/{address}/transactions', method: 'get', param: 'blockchain' },
	{ file: 'addressHistory', name: 'EVM_TRANSACTIONS_NETWORKS', path: '/addresses-historical/evm/{blockchain}/{network}/{address}/transactions', method: 'get', param: 'network' },
	{ file: 'addressHistory', name: 'EVM_TOKENS_TRANSFERS_BLOCKCHAINS', path: '/addresses-historical/evm/{blockchain}/{network}/{address}/tokens-transfers', method: 'get', param: 'blockchain' },
	{ file: 'addressHistory', name: 'EVM_TOKENS_TRANSFERS_NETWORKS', path: '/addresses-historical/evm/{blockchain}/{network}/{address}/tokens-transfers', method: 'get', param: 'network' },
	// blockchainFees
	{ file: 'blockchainFees', name: 'EVM_MEMPOOL_BLOCKCHAINS', path: '/blockchain-fees/evm/{blockchain}/{network}/mempool', method: 'get', param: 'blockchain' },
	{ file: 'blockchainFees', name: 'EVM_MEMPOOL_NETWORKS', path: '/blockchain-fees/evm/{blockchain}/{network}/mempool', method: 'get', param: 'network' },
	{ file: 'blockchainFees', name: 'EVM_EIP1559_BLOCKCHAINS', path: '/blockchain-fees/evm/{blockchain}/{network}/eip-1559', method: 'get', param: 'blockchain' },
	{ file: 'blockchainFees', name: 'EVM_EIP1559_NETWORKS', path: '/blockchain-fees/evm/{blockchain}/{network}/eip-1559', method: 'get', param: 'network' },
	// utils
	{ file: 'utils', name: 'EVM_VALIDATE_ADDRESS_BLOCKCHAINS', path: '/utils/evm/{blockchain}/{network}/validate-address', method: 'post', param: 'blockchain' },
	{ file: 'utils', name: 'EVM_VALIDATE_ADDRESS_NETWORKS', path: '/utils/evm/{blockchain}/{network}/validate-address', method: 'post', param: 'network' },
	// transactionsData
	{ file: 'transactionsData', name: 'EVM_DETAILS_BLOCKCHAINS', path: '/transactions/evm/{blockchain}/{network}/{transactionHash}', method: 'get', param: 'blockchain' },
	{ file: 'transactionsData', name: 'EVM_DETAILS_NETWORKS', path: '/transactions/evm/{blockchain}/{network}/{transactionHash}', method: 'get', param: 'network' },
	{ file: 'transactionsData', name: 'EVM_INTERNAL_BLOCKCHAINS', path: '/transactions/evm/{blockchain}/{network}/{transactionHash}/internal', method: 'get', param: 'blockchain' },
	{ file: 'transactionsData', name: 'EVM_LOGS_BLOCKCHAINS', path: '/transactions/evm/{blockchain}/{network}/{transactionHash}/logs', method: 'get', param: 'blockchain' },
	{ file: 'transactionsData', name: 'EVM_TOKENS_TRANSFERS_BLOCKCHAINS', path: '/transactions/evm/{blockchain}/{network}/{transactionHash}/tokens-transfers', method: 'get', param: 'blockchain' },
	{ file: 'transactionsData', name: 'UTXO_DETAILS_BLOCKCHAINS', path: '/transactions/utxo/{blockchain}/{network}/{transactionHash}', method: 'get', param: 'blockchain' },
	{ file: 'transactionsData', name: 'UTXO_RAW_DATA_BLOCKCHAINS', path: '/transactions/utxo/{blockchain}/{network}/{transactionHash}/raw-data', method: 'get', param: 'blockchain' },
	// addressLatest
	{ file: 'addressLatest', name: 'EVM_NEXT_NONCE_BLOCKCHAINS', path: '/addresses-latest/evm/{blockchain}/{network}/{address}/next-available-nonce', method: 'get', param: 'blockchain' },
	{ file: 'addressLatest', name: 'EVM_NEXT_NONCE_NETWORKS', path: '/addresses-latest/evm/{blockchain}/{network}/{address}/next-available-nonce', method: 'get', param: 'network' },
	// hdWallet
	{ file: 'hdWallet', name: 'EVM_HD_WALLET_BLOCKCHAINS', path: '/hd-wallets/evm/{blockchain}/{network}/{extendedPublicKey}/assets', method: 'get', param: 'blockchain' },
	{ file: 'hdWallet', name: 'EVM_HD_WALLET_NETWORKS', path: '/hd-wallets/evm/{blockchain}/{network}/{extendedPublicKey}/assets', method: 'get', param: 'network' },
];

/**
 * Pull an enum out of the spec for a given path/method/parameter.
 *
 * @param {Object} spec the parsed OpenAPI document
 * @param {Object} m one MAPPINGS entry
 * @return {(Array<string>|null)} the enum, or null when the path/param is absent
 */
function specEnum(spec, m) {
	const params = spec.paths?.[m.path]?.[m.method]?.parameters;
	if (!Array.isArray(params)) return null;
	const found = params.find((p) => p.name === m.param);
	return found?.schema?.enum ?? null;
}

/**
 * Read the values of an exported `as const` string array from a TS source file.
 *
 * @param {string} src the file contents
 * @param {string} name the exported constant name
 * @return {(Array<string>|null)} the values, or null when not found
 */
function nodeEnum(src, name) {
	const re = new RegExp(`export const ${name}\\s*=\\s*\\[([^\\]]*)\\]`, 's');
	const match = src.match(re);
	if (!match) return null;
	return [...match[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
}

const specArg = process.argv[2];
const spec = specArg
	? JSON.parse(readFileSync(specArg, 'utf8'))
	: await (await fetch(SPEC_URL)).json();

console.log(`spec version ${spec.info?.version} — ${Object.keys(spec.paths ?? {}).length} paths\n`);

const sources = new Map();
let drift = 0;
let checked = 0;
let skipped = 0;

for (const m of MAPPINGS) {
	const file = `nodes/CryptoApis/actions/${m.file}/blockchainEnums.ts`;
	if (!sources.has(file)) sources.set(file, readFileSync(file, 'utf8'));

	const declared = nodeEnum(sources.get(file), m.name);
	const actual = specEnum(spec, m);

	if (declared === null) {
		console.log(`SKIP   ${m.file}/${m.name} — not found in ${file}`);
		skipped++;
		continue;
	}
	if (actual === null) {
		console.log(`SKIP   ${m.file}/${m.name} — ${m.method.toUpperCase()} ${m.path} (${m.param}) not in spec`);
		skipped++;
		continue;
	}

	checked++;
	const a = new Set(actual);
	const d = new Set(declared);
	const missing = [...a].filter((x) => !d.has(x));
	const extra = [...d].filter((x) => !a.has(x));

	if (missing.length === 0 && extra.length === 0) {
		console.log(`OK     ${m.file}/${m.name} (${a.size})`);
		continue;
	}
	drift++;
	console.log(`DRIFT  ${m.file}/${m.name}`);
	if (missing.length) console.log(`         node is MISSING: ${missing.join(', ')}`);
	if (extra.length) console.log(`         node has EXTRA:  ${extra.join(', ')}`);
}

console.log(`\n${checked} checked, ${drift} drifted, ${skipped} skipped`);
process.exit(drift);
