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
				// Fires on any field whose NAME contains "token". None of the matches are
				// secrets — a transfer amount, on-chain token indexes, a mint address — but
				// n8n's verification scanner (@n8n/scan-community-package) builds its OWN
				// eslint config and ignores this file, so switching the rule off here does
				// not clear the gate. The fields are therefore masked at the source, and
				// this stays 'error' so local runs agree with the scanner instead of
				// reporting clean while verification fails.
				'n8n-nodes-base/node-param-type-options-password-missing': 'error',
				// Fires because these numeric params intentionally have no upper bound —
				// block heights, confirmation targets and token ids are open-ended, and
				// inventing a maxValue would reject valid input. n8n's own scanner
				// disables this rule for the same reason ("sometimes the 3rd party API
				// does have a maximum limit, so maxValue is valid"), so we match it.
				'n8n-nodes-base/node-param-type-options-max-value-present': 'off',
				// Inputs/outputs may use the NodeConnectionTypes enum rather than the
				// string literal 'main'. These two rules predate the enum and still
				// demand the literal; n8n's verification scanner switches both off for
				// exactly that reason, and the enum is what its
				// @n8n/community-nodes/node-connection-type-literal rule requires.
				'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
				'n8n-nodes-base/node-class-description-outputs-wrong': 'off',
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
