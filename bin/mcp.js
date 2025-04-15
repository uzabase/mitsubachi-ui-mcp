#!/usr/bin/env node

// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// src/manifest.ts
import custom from "mitsubachi-ui/custom-elements.json";
var CustomElementJson = class {
  raw;
  constructor(raw) {
    this.raw = raw;
  }
  get tagName() {
    return this.raw.tagName;
  }
  get summary() {
    return this.raw.summary;
  }
  describe(attribute) {
    for (let { name, description } of this.raw.attributes) {
      if (name === attribute) {
        return description;
      }
    }
  }
};
var ManifestJson = class {
  raw;
  constructor(raw) {
    this.raw = raw;
  }
  get summaries() {
    const elements = this.customElements;
    let res = {};
    for (const [_, v] of Object.entries(elements)) {
      if (v.summary) {
        res[v.tagName] = v.summary;
      }
    }
    return res;
  }
  get customElements() {
    const results = {};
    for (const module of this.modules) {
      const declarations = module["declarations"];
      const customElements = declarations.filter(
        (d) => d.customElement && d.tagName.startsWith("sp-")
      );
      for (const customElement of customElements) {
        const c = new CustomElementJson(customElement);
        results[c.tagName] = c;
      }
    }
    return results;
  }
  get modules() {
    return this.raw["modules"];
  }
};
function loadManifest(manifestJson) {
  return new ManifestJson(manifestJson);
}
function loadDefaultManifest() {
  return loadManifest(custom);
}

// src/index.ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// src/tool.ts
function makeWebComponentContent(manifest) {
  const res = [];
  for (const [tagName, summary] of Object.entries(manifest.summaries)) {
    res.push({ type: "text", text: `\u30AB\u30B9\u30BF\u30E0\u8981\u7D20 <${tagName}> ${summary}` });
  }
  return res;
}

// src/sp-logo.ts
import { z } from "zod";

// src/schema.ts
function describe(schema, customElement) {
  for (const [attributeName, value] of Object.entries(schema)) {
    if (!schema[attributeName].description) {
      const description = customElement.describe(attributeName);
      if (description) {
        schema[attributeName] = value.describe(description);
      }
    }
  }
}

// src/sp-logo.ts
import { html, nothing } from "lit-html";
function getSpLogoDefinition(customElement) {
  const input = { language: z.enum(["ja", "en", "zh"]) };
  describe(input, customElement);
  return [
    input,
    ({ language }) => {
      return html`<sp-logo language=${language || nothing}></sp-logo>`;
    }
  ];
}

// src/index.ts
import { render } from "@lit-labs/ssr";
import {
  collectResult
} from "@lit-labs/ssr/lib/render-result.js";
function buildMcpServer() {
  return new McpServer({
    name: "mitsubachi-mcp",
    version: "1.0.0",
    capabilities: {
      resources: {},
      tools: {}
    }
  });
}
function defineTools(server, manifest) {
  const content = makeWebComponentContent(manifest);
  server.tool(
    "mitsubachi-ui-web-components",
    "mitsubachi-ui\u306E\u30AB\u30B9\u30BF\u30E0\u8981\u7D20\u306E\u4E00\u89A7\u3092\u63D0\u4F9B\u3057\u307E\u3059\u3002",
    {},
    async () => {
      return {
        content
      };
    }
  );
  for (const { tag, body } of [{ tag: "sp-logo", body: getSpLogoDefinition }]) {
    const customElement = manifest.customElements[tag];
    if (customElement) {
      const [input, builder] = body(customElement);
      server.tool(
        `mitsubachi-${tag}`,
        customElement.summary ?? `<${tag}>\u3092\u751F\u6210\u3057\u307E\u3059\u3002`,
        input,
        async (shape) => {
          const rendered = await collectResult(render(builder(shape)));
          return {
            content: [
              {
                type: "text",
                text: rendered
              }
            ]
          };
        }
      );
    }
  }
}
async function main() {
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
export {
  main
};
