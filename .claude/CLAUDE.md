# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

An [n8n](https://n8n.io/) community node package (`@cryptoapis-io/n8n-nodes-cryptoapis`) that integrates [Crypto APIs](https://cryptoapis.io/) blockchain services into n8n workflows. It provides two node types:

1. **CryptoApis** — A regular workflow node with 13 resources covering blockchain data, transactions, market data, HD wallets, contracts, events, fees, broadcast, simulation, address history, and utilities. Has `usableAsTool: true` so AI Agent nodes can use it directly.
2. **CryptoApisTool** — An AI Agent tool sub-node that connects to a CryptoAPIs MCP server, discovers all available tools, and exposes them as LangChain `DynamicStructuredTool` instances.

## Build & Development Commands

```bash
npm install               # install dependencies
npm run build             # compile TypeScript + copy icons (tsc && gulp build:icons)
npm run dev               # watch mode (tsc --watch)
npm run lint              # type-check only (tsc --noEmit)
npm run prepublishOnly    # runs build before publish
```

Tests are not yet set up. Linting is type-check only (no ESLint/Prettier configured).

## Architecture

**Single package**, CommonJS output, TypeScript (ES2022 target, Node 18+).

```
credentials/
└── CryptoApisApi.credentials.ts    # API key, REST URL, MCP URL

nodes/CryptoApis/
├── CryptoApis.node.ts              # Main node: 13 resources, router-based execute()
├── CryptoApis.node.json            # Codex metadata (categories, resources)
├── CryptoApisTool.node.ts          # AI tool sub-node: MCP client + supplyData()
├── CryptoApisTool.node.json        # Codex metadata (AI category)
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

**CryptoApisTool node**: `supplyData()` → `McpHttpClient` connects to MCP server → `listTools()` discovers tools → converts JSON Schema to Zod → returns `DynamicStructuredTool[]` as toolkit

### Action Pattern (13 resources)

Each resource folder has two files:

- **`index.ts`** — Exports `*Operations` (INodeProperties[] — operation dropdown) and `*Fields` (INodeProperties[] — input fields with `displayOptions` conditions)
- **`execute.ts`** — Exports `async execute*(this: IExecuteFunctions, i: number)` that reads parameters, calls `cryptoApisRequest()`, and returns `INodeExecutionData[]`

### Transport Layer

- **`requestHelpers.ts`**: `cryptoApisRequest(method, endpoint, body?, qs?)` — wraps `this.helpers.httpRequestWithAuthentication('cryptoApisApi', ...)`. POST/PUT bodies are auto-wrapped in `{ data: { item: { ... } } }`. Response helpers: `unwrapResponse()`, `unwrapSingleItem()`, `unwrapItems()`.
- **`paginationHelpers.ts`**: `handleOffsetPagination()` and `handleCursorPagination()` — both support `returnAll` flag and configurable limits. Default page size: 50.
- **`blockchainConstants.ts`**: `BLOCKCHAIN_NETWORKS` mapping, `EVM_BLOCKCHAINS`, `UTXO_BLOCKCHAINS`, `EVM_NETWORK_CHAIN_IDS`, helper functions `blockchainOptions()`, `networkOptions()`, `getChainIdForNetwork()`.

### CryptoApisTool (MCP Client)

Zero external runtime dependencies — uses only `@langchain/core` and `zod` as peerDependencies (provided by n8n at runtime).

Key components inside `CryptoApisTool.node.ts`:
- **`McpHttpClient`** — Minimal MCP Streamable HTTP client (~100 lines). Implements `initialize()` → `listTools()` → `callTool()` via JSON-RPC over HTTP POST. Handles both JSON and SSE responses. Session managed via `Mcp-Session-Id` header.
- **`propertyToZod()` / `schemaToZodObject()`** — Converts JSON Schema (from MCP tool definitions) to Zod objects at runtime. Handles object, string, number, boolean, array, enum, required/optional, descriptions.
- **`supplyData()`** — Connects to the MCP server URL from credentials, discovers tools, converts each to `DynamicStructuredTool`, returns as toolkit for AI Agent nodes.

## Credentials

`CryptoApisApi` credentials type with three fields:

| Field | Default | Purpose |
|-------|---------|---------|
| `apiKey` | _(required)_ | Crypto APIs API key (sent as `x-api-key` header) |
| `apiUrl` | `https://rest.cryptoapis.io` | REST API base URL (used by CryptoApis node) |
| `mcpUrl` | `https://mcp.cryptoapis.io/mcp` | MCP server URL (used by CryptoApisTool node) |

API version `2024-12-12` is sent as `x-api-version` header on all requests.

## Naming Conventions

| Element | Case | Example |
|---------|------|---------|
| Package name | `@<scope>/n8n-nodes-<name>` | `@cryptoapis-io/n8n-nodes-cryptoapis` |
| Node class | PascalCase | `CryptoApis`, `CryptoApisTool` |
| Node `name` | camelCase | `cryptoApis`, `cryptoApisTool` |
| Resource values | camelCase | `marketData`, `addressLatest` |
| Operation values | kebab-case | `get-asset-details-by-id` |
| Action folder names | camelCase | `actions/marketData/` |
| Transport helpers | camelCase | `cryptoApisRequest()` |
| Blockchain constants | UPPER_SNAKE | `BLOCKCHAIN_NETWORKS`, `EVM_BLOCKCHAINS` |

## Key Conventions

- **CommonJS output** — n8n requires CJS. The `@modelcontextprotocol/sdk` is ESM-only, which is why CryptoApisTool implements MCP protocol with raw `fetch()` instead.
- **peerDependencies** — `@langchain/core` and `zod` are declared as peerDependencies (n8n provides them at runtime) and devDependencies (for compilation).
- **Zero runtime `dependencies`** — package.json has no `dependencies` field. Everything is either a peerDependency or built-in.
- **`usableAsTool: true`** — Set on the main CryptoApis node so AI Agent nodes can invoke it directly without needing the separate CryptoApisTool sub-node.
- **`supplyData()` pattern** — CryptoApisTool implements `INodeType.supplyData()` to output `NodeConnectionTypes.AiTool`. Returns `{ response: { tools, getTools }, closeFunction }`.
- **Body wrapping** — POST/PUT requests to Crypto APIs require body wrapped in `{ data: { item: { ... } } }`. This is handled automatically by `cryptoApisRequest()`.
- **Response unwrapping** — API responses come wrapped in `{ data: { item: ... } }` or `{ data: { items: [...] } }`. Use `unwrapSingleItem()` or `unwrapItems()`.
- **displayOptions** — All action fields use `displayOptions.show` to conditionally display based on selected resource and operation.
- **Pagination** — Two styles: cursor-based (most endpoints) and offset-based (some UTXO endpoints). Both support `returnAll` toggle in the UI.
- **n8n community node naming** — n8n supports scoped packages: `@<scope>/n8n-nodes-<name>`. The `n8n.nodes` and `n8n.credentials` arrays in package.json list the compiled `.js` paths.

## Resources (13 total)

| Resource | Key Operations |
|----------|---------------|
| `marketData` | get-asset-details-by-id, get-asset-details-by-symbol, list-assets, get-exchange-rate, list-exchange-rates |
| `addressLatest` | get-balance, list-transactions, list-token-transfers, list-internal-transactions, get-next-nonce (EVM/UTXO/Solana/XRP/Kaspa) |
| `blockData` | get-block-by-height, get-block-by-hash, list-transactions-by-block, get-last-mined-block (EVM/UTXO/XRP) |
| `blockchainFees` | get-fee-recommendations, get-eip-1559-fees, estimate-gas (EVM/UTXO/XRP) |
| `transactionsData` | get-transaction-details, list-internal-transactions, list-token-transfers, list-logs (EVM/UTXO/Solana/XRP/Kaspa) |
| `hdWallet` | sync, activate, delete, get-status, get-balance, list-transactions, list-token-transfers (EVM/UTXO/XRP) |
| `addressHistory` | get-statistics, list-transactions, list-token-transfers, list-internal-transactions (EVM/UTXO) |
| `prepareTransactions` | prepare-transaction, prepare-token-transfer (EVM) |
| `simulate` | simulate-transaction (EVM) |
| `broadcast` | broadcast-signed-transaction (EVM/UTXO) |
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

GitHub Actions workflow (`.github/workflows/publish.yml`): triggers on GitHub release creation, runs `npm publish --provenance --access public` with Node 20.
