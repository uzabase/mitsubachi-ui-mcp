#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadDefaultManifest, Manifest } from "./manifest.js";
import packageInfo from '../package.json' with { type: "json" };

function buildMcpServer(version: string): McpServer {
  
  return new McpServer({
    name: "mitsubachi-ui-mcp",
    version: version,
    capabilities: {
      resources: {},
      tools: {},
    },
  });
}

function defineTool(server: McpServer, manifest: Manifest) {
  const customElements = manifest.customElements;
  const texts: string[] = [];
  for (const [tag, elm] of Object.entries(customElements)) {
    texts.push(`<${tag}>のCustom Element Manifest: ${elm.stringify()}`);
  }

  server.tool(
    "mitsubachi-ui-web-components",
    "Custom Elements Manifestを提供します。",
    {},
    async () => {
      return {
        content: texts.map((text) => {
          return { type: "text", text };
        }),
      };
    }
  );
}

export async function main() {
  const server = buildMcpServer(packageInfo.version);
  const manifest = loadDefaultManifest();
  defineTool(server, manifest);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mitsubachi-ui MCP Server running on stdio");
}
main().catch((error) => {
  console.error(error);
  throw error;
});

