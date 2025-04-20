#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { ZodRawShape } from "zod";
import { loadDefaultManifest, Manifest } from "./manifest.js";

function buildMcpServer(): McpServer {
  return new McpServer({
    name: "mitsubachi-mcp",
    version: "1.0.0",
    capabilities: {
      resources: {},
      tools: {},
    },
  });
}

function defineTools(server: McpServer, manifest: Manifest) {
  const customElements = manifest.customElements;
  const texts: string[] = [];
  for (const [tag, elm] of Object.entries(customElements)) {
    texts.push(`<${tag}>のcustom element manifest: ${elm.stringify()}`);
  }

  server.tool(
    "mitsubachi-ui-web-components",
    "mitsubachi-uiのcustom-elements.jsonを提供します。",
    {},
    async () => {
      return {
        content: texts.map((text) => {
          return { type: "text", text };
        }),
      };
    }
  );
  // server.tool(
  //   "mitsubachi-ui-web-components",
  //   "mitsubachi-uiのカスタム要素の一覧を提供します。",
  //   {},
  //   async () => {
  //     return {
  //       content,
  //     };
  //   }
  // );
  // for (const { tag, body } of [{ tag: "sp-logo", body: getSpLogoDefinition }]) {
  //   const customElement = manifest.customElements[tag];
  //   if (customElement) {
  //     const [input, builder] = body(customElement);
  //     server.tool(
  //       `mitsubachi-${tag}`,
  //       customElement.summary ?? `<${tag}>を生成します。`,
  //       input,
  //       async (shape: ZodRawShape) => {
  //         const rendered = await collectResult(render(builder(shape)));
  //         return {
  //           content: [
  //             {
  //               type: "text",
  //               text: rendered,
  //             },
  //           ],
  //         };
  //       }
  //     );
  //   }
  // }
}

export async function main() {
  const server = buildMcpServer();
  const manifest = loadDefaultManifest();
  defineTools(server, manifest);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mitsubachi-ui MCP Server running on stdio");
}
main().catch((error) => {
  console.error(error);
  throw error;
});

