import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CryptoApisApi implements ICredentialType {
	name = 'cryptoApisApi';
	displayName = 'Crypto APIs API';
	documentationUrl = 'https://developers.cryptoapis.io/technical-documentation/general-information/authentication';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Crypto APIs API key. Get one at https://app.cryptoapis.io/',
		},
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: 'https://rest.cryptoapis.io',
			description: 'Base URL for the Crypto APIs REST API. Override this if you have a custom setup.',
		},
		{
			displayName: 'MCP URL',
			name: 'mcpUrl',
			type: 'string',
			default: 'https://ai.cryptoapis.io/mcp',
			description: 'URL of the Crypto APIs MCP server endpoint. Used by the Crypto APIs Tool node for AI agent integration.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
				'x-api-version': '2024-12-12',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiUrl || "https://rest.cryptoapis.io"}}',
			url: '/market-data/metadata/assets',
			qs: { limit: 1, offset: 0 },
		},
	};
}
