# n8n-nodes-cryptoapis

This is an [n8n](https://n8n.io/) community node for [Crypto APIs](https://cryptoapis.io/). It lets you use Crypto APIs blockchain services directly in your n8n workflows.

Crypto APIs provides unified blockchain APIs for 15+ blockchains including Bitcoin, Ethereum, Polygon, Avalanche, XRP, Solana, and more.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Credentials

You need a Crypto APIs API key to use this node. Get one at [app.cryptoapis.io](https://app.cryptoapis.io/).

The credential supports an optional **API URL** field for users with custom API setups. The default is `https://rest.cryptoapis.io`.

## Resources & Operations

### Address Latest
Query current balances and recent transactions (last 14 days) across EVM, UTXO, Solana, XRP, and Kaspa blockchains.

### Address History
Full transaction history for synced addresses. Requires address sync first. Supports EVM and UTXO blockchains.

### Block Data
Get block details by height or hash, list transactions within blocks, and retrieve latest mined blocks for EVM, UTXO, and XRP.

### Blockchain Fees
Fee recommendations and gas estimation for EVM (including EIP-1559), UTXO smart fee estimation, and XRP fee recommendations.

### Transactions Data
Transaction details, internal transactions, token transfers, and event logs across EVM, UTXO, Solana, XRP, and Kaspa.

### Market Data
Asset details, exchange rates, and supported asset metadata (crypto and fiat).

### Contracts
Token details by contract address for EVM (Ethereum, BSC, Ethereum Classic) and Solana.

### HD Wallet
HD wallet management (sync, list, activate, delete), address derivation, balance queries, and transaction preparation for EVM, UTXO, and XRP.

### Prepare Transactions
Build unsigned EVM transactions for native coin, ERC-20 token, and ERC-721 NFT transfers.

### Simulate
Dry-run EVM transactions to preview outcomes without broadcasting.

### Broadcast
Broadcast signed transactions to any supported blockchain network.

### Blockchain Events
Create and manage webhook subscriptions for blockchain events (confirmed/unconfirmed transactions, new blocks, etc.).

### Utils
Address validation, raw transaction decoding, address derivation from xPub, Bitcoin Cash address conversion, and XRP X-Address encode/decode.

## AI Agent Integration

This node has `usableAsTool: true`, so it can be used directly as a tool by n8n's AI Agent node.

For full MCP integration, use n8n's built-in **MCP Client Tool** node with the [Crypto APIs MCP servers](https://github.com/Crypto-APIs/cryptoapis-mcp). Point the MCP Client Tool at your Crypto APIs MCP server endpoint and it will auto-discover all available blockchain tools.

## Supported Blockchains

**EVM**: Ethereum, Ethereum Classic, Binance Smart Chain, Polygon, Tron, Avalanche, Arbitrum, Base, Optimism

**UTXO**: Bitcoin, Bitcoin Cash, Litecoin, Dogecoin, Dash, Zcash

**Other**: XRP (Ripple), Solana, Kaspa

## Development

```bash
npm install
npm run build     # Compiles to dist/
npm run dev       # Watch mode
npm run lint      # Type check
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
