# n8n-nodes-cryptoapis

This is an [n8n](https://n8n.io/) community node for [Crypto APIs](https://cryptoapis.io/). It lets you use Crypto APIs blockchain services directly in your n8n workflows.

Crypto APIs provides unified blockchain APIs for 15+ blockchains including Bitcoin, Ethereum, Polygon, Avalanche (C-Chain), XRP, Solana, and more.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Credentials

You need a Crypto APIs API key to use this node. Get one at [app.cryptoapis.io](https://app.cryptoapis.io/).

The credential supports an optional **API URL** field for users with custom API setups. The default is `https://rest.cryptoapis.io`.

### A note on masked fields

**Token Amount** and **Token ID** fields render as masked inputs (dots instead of characters). They are **not** secrets — they are public on-chain values such as a transfer amount, an ERC-721 NFT index, or a Tezos FA2 token index, and none of them are sensitive.

They are masked because n8n's community-node rules treat any parameter whose *name* contains "token" as a credential, and the rule's exemption list cannot be extended by a package. Renaming the fields would remove the masking, but n8n discards a saved parameter whose name no longer matches the node, which would silently break existing workflows. The rename is planned for the next major version, with a migration note.

If you need to check what you typed, you can widen the field or paste the value into a Set node first.

## Resources & Operations

### Address Latest
Query current balances and recent transactions (last 14 days) across EVM, UTXO, Solana, XRP, and Kaspa blockchains.

### Address History
Full transaction history for synced addresses. Requires address sync first. Supports EVM and UTXO blockchains.

### Block Data
Get block details by height or hash, list transactions within blocks, and retrieve latest mined blocks for EVM, UTXO, and XRP.

### Blockchain Fees
Fee recommendations and gas estimation for EVM (including EIP-1559), UTXO smart fee estimation, XRP fee recommendations, Tezos fee estimates for native XTZ / FA1.2 / FA2 transfers, and Solana compute-unit estimates for native, SPL token, and program-invocation transactions.

### Transactions Data
Transaction details, internal transactions, token transfers, and event logs across EVM, UTXO, Solana, XRP, and Kaspa.

### Market Data
Asset details, exchange rates, and supported asset metadata (crypto and fiat).

### Contracts
Token details by contract address for EVM (Ethereum, BSC, Ethereum Classic) and Solana.

### HD Wallet
HD wallet management (sync, list, activate, delete), address derivation, balance queries, and transaction preparation for EVM, UTXO, and XRP.

### Prepare Transactions
Build unsigned transactions across six chain families: EVM (native coin, ERC-20, ERC-721), Tezos (native XTZ, FA1.2, FA2), Solana (native SOL, SPL tokens), XRP, Kaspa, and UTXO. Kaspa and UTXO support multiple outputs in one transaction.

### Simulate
Dry-run Ethereum transactions to preview outcomes without broadcasting.

### Broadcast
Broadcast signed transactions to any supported blockchain network.

### Blockchain Events
Create and manage webhook subscriptions for blockchain events (confirmed/unconfirmed transactions, new blocks, etc.).

### Utils
Address validation, raw transaction decoding, address derivation from xPub, Bitcoin Cash address conversion, and XRP X-Address encode/decode.

## AI Agent Integration

### Using as an AI Tool (usableAsTool)

The main **Crypto APIs** node has `usableAsTool: true`, so it can be used directly as a tool by n8n's AI Agent node — just connect it to an AI Agent and it will expose its operations as tool calls.

### MCP Client Tool

You can also use n8n's built-in **MCP Client Tool** node to connect to the hosted Crypto APIs MCP server at `https://ai.cryptoapis.io/mcp` or a [self-hosted instance](https://github.com/CryptoAPIs-io/cryptoapis-mcp-hub). This gives AI agents access to 50+ blockchain tools via MCP.

## Supported Blockchains & Networks

### EVM

| Blockchain | Mainnet | Testnet |
|------------|---------|---------|
| Ethereum | mainnet | sepolia |
| Ethereum Classic | mainnet | mordor |
| Binance Smart Chain | mainnet | testnet |
| Polygon | mainnet | amoy |
| Avalanche (C-Chain) | mainnet | fuji |
| Tron | mainnet | nile |
| Arbitrum | mainnet | sepolia |
| Base | mainnet | sepolia |
| Optimism | mainnet | sepolia |

### UTXO

| Blockchain | Mainnet | Testnet |
|------------|---------|---------|
| Bitcoin | mainnet | testnet |
| Bitcoin Cash | mainnet | testnet |
| Litecoin | mainnet | testnet |
| Dogecoin | mainnet | testnet |
| Dash | mainnet | testnet |
| Zcash | mainnet | testnet |

### Other

| Blockchain | Mainnet | Testnet |
|------------|---------|---------|
| XRP (Ripple) | mainnet | testnet |
| Solana | mainnet | devnet |
| Kaspa | mainnet | — |

## Development

```bash
npm install
npm run build       # Compiles to dist/
npm run dev         # Watch mode
npm run lint        # Type check + ESLint (n8n node rules)
npm run typecheck   # Type check only
```

To check the package against n8n's own verification gate:

```bash
npx @n8n/scan-community-package @cryptoapis-io/n8n-nodes-cryptoapis
```

### Local testing

```bash
# Install in local n8n
cd ~/.n8n
npm install /path/to/cryptoapis-n8n-nodes
# Then restart n8n
```

## License

[MIT](LICENSE)
