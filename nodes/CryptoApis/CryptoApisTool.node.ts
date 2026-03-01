import { DynamicStructuredTool } from '@langchain/core/tools';
import type {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	ISupplyDataFunctions,
	SupplyData,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Minimal MCP client – MCP Streamable HTTP transport via fetch()
// No @modelcontextprotocol/sdk dependency needed.
// ---------------------------------------------------------------------------

interface McpToolDefinition {
	name: string;
	description?: string;
	inputSchema: Record<string, unknown>;
}

class McpHttpClient {
	private readonly url: string;
	private readonly headers: Record<string, string>;
	private sessionId?: string;
	private nextId = 1;

	constructor(url: string, apiKey: string) {
		this.url = url;
		this.headers = {
			'Content-Type': 'application/json',
			Accept: 'application/json, text/event-stream',
			'x-api-key': apiKey,
		};
	}

	private async rpc(
		method: string,
		params?: Record<string, unknown>,
	): Promise<unknown> {
		const id = this.nextId++;
		const headers: Record<string, string> = { ...this.headers };
		if (this.sessionId) {
			headers['Mcp-Session-Id'] = this.sessionId;
		}

		const res = await fetch(this.url, {
			method: 'POST',
			headers,
			body: JSON.stringify({
				jsonrpc: '2.0',
				method,
				...(params !== undefined ? { params } : {}),
				id,
			}),
		});

		if (!res.ok) {
			const body = await res.text().catch(() => '');
			throw new Error(
				`MCP ${method} failed (${res.status}): ${body || res.statusText}`,
			);
		}

		const sid = res.headers.get('mcp-session-id');
		if (sid) this.sessionId = sid;

		const contentType = res.headers.get('content-type') ?? '';
		if (contentType.includes('text/event-stream')) {
			return this.parseSSE(await res.text(), id);
		}

		const json = (await res.json()) as {
			result?: unknown;
			error?: { code: number; message: string };
		};
		if (json.error) {
			throw new Error(`MCP error ${json.error.code}: ${json.error.message}`);
		}
		return json.result;
	}

	private parseSSE(text: string, expectedId: number): unknown {
		for (const line of text.split('\n')) {
			if (!line.startsWith('data: ')) continue;
			try {
				const json = JSON.parse(line.slice(6)) as {
					id?: number;
					result?: unknown;
					error?: { code: number; message: string };
				};
				if (json.id === expectedId) {
					if (json.error) {
						throw new Error(
							`MCP error ${json.error.code}: ${json.error.message}`,
						);
					}
					return json.result;
				}
			} catch (e) {
				if (e instanceof Error && e.message.startsWith('MCP error')) throw e;
			}
		}
		throw new Error('No matching JSON-RPC response found in SSE stream');
	}

	private async notify(method: string): Promise<void> {
		const headers: Record<string, string> = { ...this.headers };
		if (this.sessionId) {
			headers['Mcp-Session-Id'] = this.sessionId;
		}
		await fetch(this.url, {
			method: 'POST',
			headers,
			body: JSON.stringify({ jsonrpc: '2.0', method }),
		});
	}

	async initialize(): Promise<void> {
		await this.rpc('initialize', {
			protocolVersion: '2025-03-26',
			capabilities: {},
			clientInfo: { name: 'n8n-cryptoapis', version: '1.0' },
		});
		await this.notify('notifications/initialized');
	}

	async listTools(): Promise<McpToolDefinition[]> {
		const allTools: McpToolDefinition[] = [];
		let cursor: string | undefined;

		do {
			const params: Record<string, unknown> = {};
			if (cursor) params.cursor = cursor;

			const result = (await this.rpc('tools/list', params)) as
				| { tools?: McpToolDefinition[]; nextCursor?: string }
				| undefined;

			allTools.push(...(result?.tools ?? []));
			cursor = result?.nextCursor;
		} while (cursor);

		return allTools;
	}

	async callTool(
		name: string,
		args: Record<string, unknown>,
	): Promise<unknown> {
		return this.rpc('tools/call', { name, arguments: args });
	}

	async close(): Promise<void> {
		// HTTP Streamable transport – no persistent connection to tear down
	}
}

// ---------------------------------------------------------------------------
// JSON Schema → Zod converter (handles common MCP tool schema patterns)
// ---------------------------------------------------------------------------

function propertyToZod(
	prop: Record<string, unknown>,
	required: boolean,
): z.ZodTypeAny {
	let s: z.ZodTypeAny;

	const enumValues = prop.enum as string[] | undefined;
	if (enumValues?.length) {
		s = z.enum(enumValues as [string, ...string[]]);
	} else {
		switch (prop.type as string) {
			case 'string':
				s = z.string();
				break;
			case 'number':
			case 'integer':
				s = z.number();
				break;
			case 'boolean':
				s = z.boolean();
				break;
			case 'array':
				s = z.array(
					prop.items
						? propertyToZod(
								prop.items as Record<string, unknown>,
								true,
							)
						: z.any(),
				);
				break;
			case 'object':
				s = prop.properties
					? schemaToZodObject(prop)
					: z.record(z.any());
				break;
			default:
				s = z.any();
		}
	}

	if (prop.description) {
		s = s.describe(prop.description as string);
	}

	if (!required) {
		s = s.optional();
	}

	return s;
}

function schemaToZodObject(
	schema: Record<string, unknown>,
): z.ZodObject<Record<string, z.ZodTypeAny>> {
	const properties = (schema.properties ?? {}) as Record<
		string,
		Record<string, unknown>
	>;
	const requiredSet = new Set((schema.required ?? []) as string[]);
	const shape: Record<string, z.ZodTypeAny> = {};

	for (const [key, prop] of Object.entries(properties)) {
		shape[key] = propertyToZod(prop, requiredSet.has(key));
	}

	return z.object(shape);
}

// ---------------------------------------------------------------------------
// n8n Tool Sub-Node
// ---------------------------------------------------------------------------

export class CryptoApisTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Crypto APIs Tool',
		name: 'cryptoApisTool',
		icon: 'file:cryptoapis.svg',
		group: ['transform'],
		version: 1,
		description:
			'Exposes Crypto APIs blockchain tools to AI agents via MCP. ' +
			'Connects to the Crypto APIs MCP server and auto-discovers all available tools ' +
			'for blockchain data, transactions, market data, and more.',
		defaults: { name: 'Crypto APIs Tool' },
		inputs: [],
		outputs: [NodeConnectionTypes.AiTool],
		outputNames: ['Tool'],
		credentials: [{ name: 'cryptoApisApi', required: true }],
		properties: [],
	};

	async supplyData(
		this: ISupplyDataFunctions,
		itemIndex: number,
	): Promise<SupplyData> {
		const node = this.getNode();
		const credentials = await this.getCredentials('cryptoApisApi');
		const apiKey = credentials.apiKey as string;
		const mcpUrl =
			(credentials.mcpUrl as string) || 'https://ai.cryptoapis.io/mcp';

		// 1. Connect to MCP server
		const client = new McpHttpClient(mcpUrl, apiKey);
		try {
			await client.initialize();
		} catch (err) {
			throw new NodeOperationError(
				node,
				'Failed to connect to Crypto APIs MCP server',
				{
					description: (err as Error).message,
					itemIndex,
				},
			);
		}

		// 2. Discover tools
		let mcpTools: McpToolDefinition[];
		try {
			mcpTools = await client.listTools();
		} catch (err) {
			throw new NodeOperationError(
				node,
				'Failed to list tools from Crypto APIs MCP server',
				{
					description: (err as Error).message,
					itemIndex,
				},
			);
		}

		if (!mcpTools.length) {
			throw new NodeOperationError(
				node,
				'Crypto APIs MCP server returned no tools',
				{
					itemIndex,
					description:
						'Connected successfully but the server returned an empty tool list.',
				},
			);
		}

		// 3. Convert MCP tools → LangChain DynamicStructuredTool instances
		const tools = mcpTools.map((tool) => {
			const inputSchema = tool.inputSchema as Record<string, unknown>;
			const zodSchema =
				inputSchema.type === 'object' && inputSchema.properties
					? schemaToZodObject(inputSchema)
					: z.object({});

			return new DynamicStructuredTool({
				name: tool.name,
				description: tool.description ?? '',
				schema: zodSchema as any,
				func: async (args: IDataObject) => {
					try {
						const result = await client.callTool(tool.name, args);
						return typeof result === 'string'
							? result
							: JSON.stringify(result);
					} catch (err) {
						return `Error calling ${tool.name}: ${(err as Error).message}`;
					}
				},
				metadata: { isFromToolkit: true },
			});
		});

		// 4. Return as toolkit
		return {
			response: { tools, getTools: () => tools },
			closeFunction: async () => await client.close(),
		};
	}
}
