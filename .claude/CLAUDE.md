# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

An [n8n](https://n8n.io/) community node package (`@cryptoapis-io/n8n-nodes-cryptoapis`) that integrates [Crypto APIs](https://cryptoapis.io/) blockchain services into n8n workflows. It provides ONE node type:

**CryptoApis** — A regular workflow node with 14 resources covering blockchain data, transactions, market data, HD wallets, contracts, events, fees, broadcast, simulation, address history, AML, and utilities. It sets `usableAsTool: true`, so AI Agent nodes can invoke it directly; a separate MCP sub-node was removed in favour of that plus n8n's built-in MCP Client Tool.

## Build & Development Commands

```bash
npm install               # install dependencies
npm run build             # compile TypeScript + copy icons (tsc && gulp build:icons)
npm run dev               # watch mode (tsc --watch)
npm run lint              # tsc --noEmit && eslint .  — the real gate; run this
npm run typecheck         # tsc --noEmit only
npm run lint:scan         # n8n-node lint (the CLI's own rule set)
npm run release           # cut a release (run from `main`) — see Release below
npm run prepublishOnly    # runs build before publish
```

Tests are not yet set up; `npm run lint` is the primary validation step, and it is
also the gate the release flow runs before publishing. It must stay the real
linter — it was `tsc --noEmit` alone, which reported clean while n8n's
verification scanner found 10 errors.

Note that `npx eslint .` is weaker than n8n's actual gate:
`@n8n/scan-community-package` builds its own ESLint config, ignores
`.eslintrc.js`, and loads `@n8n/eslint-plugin-community-nodes`. To check the
published package the way n8n's reviewers do:

```bash
npx @n8n/scan-community-package @cryptoapis-io/n8n-nodes-cryptoapis
```

**Never run `eslint --fix` here** — verified destructive twice, including
rewriting `xPub` → "x pub" and `EIP-1559` → "eip 1559". Fix findings by hand.

## Architecture

**Single package**, CommonJS output, TypeScript (ES2022 target, Node 18+).

```
credentials/
└── CryptoApisApi.credentials.ts    # API key, REST URL, MCP URL

nodes/CryptoApis/
├── CryptoApis.node.ts              # Main node: 14 resources, router-based execute()
├── CryptoApis.node.json            # Codex metadata (categories, resources)
├── cryptoapis.svg                  # Node icon
├── actions/
│   ├── router.ts                   # Dispatches resource → execute function
│   ├── addressLatest/              # index.ts (operations/fields), execute.ts
│   ├── addressHistory/
│   ├── blockData/
│   ├── blockchainEvents/
│   ├── blockchainFees/
│   ├── broadcast/
│   ├── contracts/
│   ├── hdWallet/
│   ├── marketData/
│   ├── prepareTransactions/
│   ├── simulate/
│   ├── transactionsData/
│   └── utils/
└── transport/
    ├── blockchainConstants.ts      # BLOCKCHAIN_NETWORKS, chain IDs, helper functions
    ├── requestHelpers.ts           # cryptoApisRequest(), unwrapResponse/Items()
    └── paginationHelpers.ts        # handleOffsetPagination(), handleCursorPagination()
```

### Data Flow

**CryptoApis node**: `execute()` → `router.ts` (switch by resource) → `actions/<resource>/execute.ts` → `cryptoApisRequest()` → Crypto APIs REST API → `unwrapResponse()` → `INodeExecutionData[]`

### Action Pattern (14 resources)

Each resource folder has two files:

- **`index.ts`** — Exports `*Operations` (INodeProperties[] — operation dropdown) and `*Fields` (INodeProperties[] — input fields with `displayOptions` conditions)
- **`execute.ts`** — Exports `async execute*(this: IExecuteFunctions, i: number)` that reads parameters, calls `cryptoApisRequest()`, and returns `INodeExecutionData[]`

### Transport Layer

- **`requestHelpers.ts`**: `cryptoApisRequest(method, endpoint, body?, qs?)` — wraps `this.helpers.httpRequestWithAuthentication('cryptoApisApi', ...)`. POST/PUT bodies are auto-wrapped in `{ data: { item: { ... } } }`. Response helpers: `unwrapResponse()`, `unwrapSingleItem()`, `unwrapItems()`.
- **`paginationHelpers.ts`**: `handleOffsetPagination()` and `handleCursorPagination()` — both support `returnAll` flag and configurable limits. Default page size: 50.
- **`blockchainConstants.ts`**: `BLOCKCHAIN_NETWORKS` mapping, `EVM_BLOCKCHAINS`, `UTXO_BLOCKCHAINS`, `EVM_NETWORK_CHAIN_IDS`, helper functions `blockchainOptions()`, `networkOptions()`, `getChainIdForNetwork()`.

## Credentials

`CryptoApisApi` credentials type with two fields:

| Field | Default | Purpose |
|-------|---------|---------|
| `apiKey` | _(required)_ | Crypto APIs API key (sent as `x-api-key` header) |
| `apiUrl` | `https://rest.cryptoapis.io` | REST API base URL |

API version `2024-12-12` is sent as `x-api-version` header on all requests.

## Naming Conventions

| Element | Case | Example |
|---------|------|---------|
| Package name | `@<scope>/n8n-nodes-<name>` | `@cryptoapis-io/n8n-nodes-cryptoapis` |
| Node class | PascalCase | `CryptoApis` |
| Node `name` | camelCase | `cryptoApis`, `cryptoApisTool` |
| Resource values | camelCase | `marketData`, `addressLatest` |
| Operation values | kebab-case | `get-asset-details-by-id` |
| Action folder names | camelCase | `actions/marketData/` |
| Transport helpers | camelCase | `cryptoApisRequest()` |
| Blockchain constants | UPPER_SNAKE | `BLOCKCHAIN_NETWORKS`, `EVM_BLOCKCHAINS` |

## Key Conventions

- **CommonJS output** — n8n requires CJS.
- **peerDependencies** — `@langchain/core` and `zod` are declared as peerDependencies (n8n provides them at runtime) and devDependencies (for compilation).
- **Zero runtime `dependencies`** — package.json has no `dependencies` field. Everything is either a peerDependency or built-in.
- **`usableAsTool: true`** — Set on the CryptoApis node so AI Agent nodes can invoke it directly.
- **Body wrapping** — POST/PUT requests to Crypto APIs require body wrapped in `{ data: { item: { ... } } }`. This is handled automatically by `cryptoApisRequest()`.
- **Response unwrapping** — API responses come wrapped in `{ data: { item: ... } }` or `{ data: { items: [...] } }`. Use `unwrapSingleItem()` or `unwrapItems()`.
- **displayOptions** — All action fields use `displayOptions.show` to conditionally display based on selected resource and operation.
- **Pagination** — Two styles: cursor-based (most endpoints) and offset-based (some UTXO endpoints). Both support `returnAll` toggle in the UI.
- **n8n community node naming** — n8n supports scoped packages: `@<scope>/n8n-nodes-<name>`. The `n8n.nodes` and `n8n.credentials` arrays in package.json list the compiled `.js` paths.

## Resources (14 total)

| Resource | Key Operations |
|----------|---------------|
| `aml` | verify-address, screen-transaction (screen-transaction: 19 chains incl. EVM/UTXO/XRP/Solana/Tezos/Kaspa/Tron; verify-address has no blockchain param) |
| `marketData` | get-asset-details-by-id, get-asset-details-by-symbol, list-assets, get-exchange-rate, list-exchange-rates |
| `addressLatest` | get-balance, list-transactions, list-token-transfers, list-internal-transactions, get-next-nonce (EVM/UTXO/Solana/XRP/Kaspa) |
| `blockData` | get-block-by-height, get-block-by-hash, list-transactions-by-block, get-last-mined-block (EVM/UTXO/XRP) |
| `blockchainFees` | get-fee-recommendations, get-eip-1559-fees, estimate-gas (EVM/UTXO/XRP); Tezos estimate-transfer / fa12 / fa2; Solana mempool + compute-unit estimates (native / token / program-invocation) |
| `transactionsData` | get-transaction-details, list-internal-transactions, list-token-transfers, list-logs (EVM/UTXO/Solana/XRP/Kaspa) |
| `hdWallet` | sync, activate, delete, get-status, get-balance, list-transactions, list-token-transfers (EVM/UTXO/XRP) |
| `addressHistory` | get-statistics, list-transactions, list-token-transfers, list-internal-transactions (EVM/UTXO) |
| `prepareTransactions` | EVM (native / ERC-20 / ERC-721, incl. Tron via dedicated endpoints), Tezos (native / FA1.2 / FA2), Solana (native / SPL), XRP (native), Kaspa (native, MAINNET-ONLY), UTXO (native). A `blockchainType` selector gates each field set and defaults to `evm`, so pre-existing workflows are unaffected. Kaspa and UTXO take a multi-output `recipients` array. |
| `simulate` | simulate-transaction (Ethereum only — the endpoint has no blockchain parameter) |
| `broadcast` | broadcast-signed-transaction (EVM/UTXO/XRP/Solana/Tezos) |
| `blockchainEvents` | create-event, list-events, delete-event (webhooks) |
| `contracts` | get-token-details (EVM/Solana) |
| `utils` | validate-address, decode-raw-transaction, derive-addresses, convert-bch-address (EVM/UTXO/XRP) |

## Git Remotes & Branching

This repo has two remotes with separate histories:

- **`origin`** → Bitbucket (`git@bitbucket.org:menadev/cryptoapis-n8n-nodes.git`) — branch `master`, full history
- **`github`** → GitHub (`git@cryptoapis.github.com:CryptoAPIs-io/cryptoapis-n8n-nodes.git`) — branch `main`, clean orphan history (no Bitbucket history)

**Workflow for syncing to GitHub:**
1. Commit and push to Bitbucket: `git push origin master`
2. Cherry-pick to GitHub (never merge — that leaks Bitbucket history):
   ```bash
   git checkout main
   git cherry-pick <commit-hash>
   git push github main
   git checkout master
   ```

**SSH config** uses host alias `cryptoapis.github.com` for the GitHub SSH key.

## Release

Managed by `@n8n/node-cli` so the repository and npm stay in sync and every release carries notes:

```bash
git checkout main && git merge --ff-only github/main
npm run release
```

Lints, builds, prompts for the bump, regenerates `CHANGELOG.md`, commits, tags `vX.Y.Z`, pushes, and creates the GitHub release. The tag push triggers `.github/workflows/publish.yml` (Node 24), which publishes with provenance via OIDC trusted publishing — there is no `NPM_TOKEN` secret, and there should not be. `publishConfig` carries `access: public` and `provenance: true` because the CLI's CI path runs a bare `npm publish`.

Constraints, each verified the hard way:

- **Release from `main`, not `master`.** The CLI passes `--git.requireBranch main`, and release-it pushes to the current branch's upstream; `master` tracks Bitbucket. `.release-it.json` cannot override it — CLI args win over config.
- **`release-it` is pinned to `^20`** — release-it 21 rejects the `-n` flag the CLI passes, so `n8n-node release` cannot run against it.
- **Never publish from a laptop** (`n8n-node release --publish`). Since 1 May 2026 n8n requires Actions-published provenance; a locally published package can never become verified.
- **npm never allows republishing a version** — a bump is always required.
- `auto-changelog` link URLs are set explicitly in `package.json`: the `github` remote is an SSH host *alias*, so derived links would point at a non-existent host, and `origin` is Bitbucket, whose links 404 for public readers.
