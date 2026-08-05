module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		sourceType: 'module',
	},
	plugins: ['eslint-plugin-n8n-nodes-base'],
	overrides: [
		{
			// Must cover the action files too, not just *.node.ts. Scoping this to
			// `nodes/**/*.node.ts` linted exactly ONE file and left every
			// actions/<resource>/index.ts unchecked — so `npx eslint .` reported clean
			// while n8n's own `@n8n/scan-community-package` gate found 43 problems in
			// those very files. The scanner is the authority; keep this in sync with it.
			files: ['nodes/**/*.ts'],
			extends: ['plugin:n8n-nodes-base/nodes'],
			rules: {
				// Fires on any field whose NAME contains "token" — here that means
				// tokenAmount, tokenId, tokenContract and tezos*TokenId, none of which are
				// secrets. They are a transfer amount, an on-chain token index, and a public
				// mint address; masking them would hide ordinary inputs from the user. The
				// one genuine secret, the API key, IS masked (see the credentials file).
				'n8n-nodes-base/node-param-type-options-password-missing': 'off',
				// Fires because these numeric params intentionally have no upper bound —
				// block heights, confirmation targets and token ids are open-ended, and
				// inventing a maxValue would reject valid input.
				'n8n-nodes-base/node-param-type-options-max-value-present': 'off',
			},
		},
		{
			// The per-event-type fields are generated in a flatMap, so their `default` is a
			// computed expression (EVENT_TYPE_BLOCKCHAINS[eventType][0]) rather than a
			// literal. Every field in that block does have a default — 4 fields, 4 defaults —
			// but the rule only recognises literals, so it reports a false positive here.
			files: ['nodes/CryptoApis/actions/blockchainEvents/index.ts'],
			rules: {
				'n8n-nodes-base/node-param-default-missing': 'off',
			},
		},
		{
			files: ['credentials/**/*.credentials.ts'],
			extends: ['plugin:n8n-nodes-base/credentials'],
			rules: {
				// Community nodes use full HTTP URLs, not n8n doc slugs
				'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
			},
		},
		{
			files: ['package.json'],
			extends: ['plugin:n8n-nodes-base/community'],
		},
	],
};
