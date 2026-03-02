module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		sourceType: 'module',
	},
	plugins: ['eslint-plugin-n8n-nodes-base'],
	overrides: [
		{
			files: ['nodes/**/*.node.ts'],
			extends: ['plugin:n8n-nodes-base/nodes'],
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
