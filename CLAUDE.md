# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build, Lint, and Dev Commands

```bash
npm install          # install dependencies
npm run build        # tsc + gulp build:icons (copies SVGs to dist/)
npm run dev          # tsc --watch for iterative development
npm run lint         # tsc --noEmit (type-check only, no emit)
```

There are no automated tests. Type-checking via `npm run lint` is the primary validation step.

Publishing is automated via GitHub Actions on release creation (`publish.yml`) using npm trusted publishing with provenance.

## Architecture Overview

This is a single n8n community node package exposing the Crypto APIs REST API (`https://rest.cryptoapis.io`) to n8n workflows. It is structured as follows:

```
credentials/
  CryptoApisApi.credentials.ts   # API key auth + credential test endpoint
nodes/CryptoApis/
  CryptoApis.node.ts             # INodeType class; declares all properties and calls router
  CryptoApis.node.json           # Codex metadata (categories, aliases)
  actions/
    router.ts                    # Dispatches resource → execute function
    <resource>/
      index.ts                   # Exports *Operations and *Fields arrays for the node descriptor
      execute.ts                 # Runtime logic for each operation in the resource
  transport/
    requestHelpers.ts            # cryptoApisRequest(), unwrapResponse/unwrapSingleItem/unwrapItems
    paginationHelpers.ts         # handleOffsetPagination(), handleCursorPagination()
    blockchainConstants.ts       # Blockchain/network lists, chain IDs, dropdown option builders
```

The 14 resources are: `addressHistory`, `addressLatest`, `aml`, `blockData`, `blockchainEvents`, `blockchainFees`, `broadcast`, `contracts`, `hdWallet`, `marketData`, `prepareTransactions`, `simulate`, `transactionsData`, `utils`.

## Key Patterns and Conventions

### Adding a new resource

1. Create `nodes/CryptoApis/actions/<resource>/index.ts` — export `<resource>Operations: INodeProperties[]` and `<resource>Fields: INodeProperties[]`.
2. Create `nodes/CryptoApis/actions/<resource>/execute.ts` — export `execute<Resource>(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]>`.
3. Import and spread both arrays into `CryptoApis.node.ts` properties.
4. Add a `case` in `actions/router.ts`.

### Adding an operation to an existing resource

- Add the option to the `operation` field's `options` array in `index.ts`.
- Add a corresponding `if (operation === '...')` block in `execute.ts`.
- Add any new field definitions (with correct `displayOptions`) in `index.ts`.

### HTTP requests

All API calls go through `cryptoApisRequest()` in `transport/requestHelpers.ts`. It:
- Reads `apiKey` and `apiUrl` from credentials.
- Sets `x-api-key` and `x-api-version: 2024-12-12` headers (via the credential `authenticate` config).
- Automatically wraps `POST`/`PUT` bodies as `{ data: { item: { ... } } }`.
- Throws `NodeApiError` on failure.

Unwrap helpers: use `unwrapSingleItem()` for single-object responses and `unwrapItems()` for arrays. Never access `response.data` directly in execute files.

### Pagination

- **Offset pagination** (`handleOffsetPagination`): used by resources like `blockchainEvents`, `marketData`. Page size capped at 50.
- **Cursor pagination** (`handleCursorPagination`): used by `addressHistory`, `addressLatest`, etc. Reads `meta.cursors.nextStartingAfter` from responses.

Both helpers accept `returnAll: boolean` and `limit: number`. When `returnAll=false` and `limit` is provided, expose both `Return All` (boolean) and `Limit` (number, hidden when `returnAll=true`) fields in `index.ts`.

### Blockchain/network handling

`transport/blockchainConstants.ts` is the single source of truth for:
- `EVM_BLOCKCHAINS`, `UTXO_BLOCKCHAINS`, and protocol-specific lists.
- `BLOCKCHAIN_NETWORKS` mapping for valid blockchain→network combinations.
- `blockchainOptions()` and `networkOptions()` for building n8n dropdown option arrays.
- `validateBlockchainNetwork()` for runtime validation.
- `getChainIdForNetwork()` for EVM chain ID lookups.

Always import from `blockchainConstants.ts` rather than hardcoding blockchain or network strings.

### TypeScript

`strict: true` is enabled. Target is `es2022`, module is `commonjs`, output goes to `dist/`. All source lives under `credentials/` and `nodes/` — both are included in `tsconfig.json`. Icons (SVG files) are copied to `dist/` via gulp.

### ESLint

Uses `eslint-plugin-n8n-nodes-base` with separate rule sets for node files, credential files, and `package.json`. Run with `npx eslint .` (no npm script alias). The rule `cred-class-field-documentation-url-miscased` is disabled because community nodes use full HTTP URLs.
