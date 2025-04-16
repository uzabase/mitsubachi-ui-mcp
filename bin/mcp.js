#!/usr/bin/env node

// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// src/manifest.ts
import custom from "mitsubachi-ui/custom-elements.json" with { type: "json" };
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
  stringify() {
    return JSON.stringify(this.raw);
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
  const customElements = manifest.customElements;
  const texts = [];
  for (const [tag, elm] of Object.entries(customElements)) {
    texts.push(`<${tag}>\u306Ecustom element manifest: ${elm.stringify()}`);
  }
  server.tool(
    "mitsubachi-ui-web-components",
    "mitsubachi-ui\u306Ecustom-elements.json\u3092\u63D0\u4F9B\u3057\u307E\u3059\u3002",
    {},
    async () => {
      return {
        content: texts.map((text) => {
          return { type: "text", text };
        })
      };
    }
  );
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
