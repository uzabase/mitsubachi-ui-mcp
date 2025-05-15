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
  stringify() {
    return JSON.stringify(this.raw);
  }
};
var ManifestJson = class {
  raw;
  constructor(raw) {
    this.raw = raw;
  }
  /**
   * sp-ではじまる名前のWeb Componentを返します。
   */
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

// package.json
var package_default = {
  name: "mitsubachi-ui-mcp",
  version: "0.14.0",
  description: "Model Context Protocol server for mitsubachi-ui components integration and usage.",
  type: "module",
  main: "./bin/mcp.js",
  bin: {
    "mitsubachi-ui-mcp": "./bin/mcp.js"
  },
  scripts: {
    build: "esbuild --bundle --format=esm --platform=node ./src/index.ts --packages=external --outfile=./bin/mcp.js",
    test: "vitest run"
  },
  repository: {
    type: "git",
    url: "git@github.com:uzabase/mitsubachi-ui-mcp.git"
  },
  keywords: [],
  author: "",
  license: "Apache-2.0 license",
  dependencies: {
    "@lit-labs/ssr": "^3.3.1",
    "@modelcontextprotocol/sdk": "^1.11.3",
    "lit-html": "^3.3.0",
    "mitsubachi-ui": "github:uzabase/mitsubachi-ui#semver:0.14.0"
  },
  devDependencies: {
    "@tsconfig/node22": "^22.0.1",
    "@types/node": "^22.15.18",
    esbuild: "^0.25.2",
    typescript: "^5.8.3",
    vitest: "^3.1.1",
    zod: "^3.24.2"
  }
};

// src/index.ts
function buildMcpServer(version) {
  return new McpServer({
    name: "mitsubachi-ui-mcp",
    version,
    capabilities: {
      resources: {},
      tools: {}
    }
  });
}
function defineTool(server, manifest) {
  const customElements = manifest.customElements;
  const texts = [];
  for (const [tag, elm] of Object.entries(customElements)) {
    texts.push(`<${tag}>\u306ECustom Element Manifest: ${elm.stringify()}`);
  }
  server.tool(
    "mitsubachi-ui-web-components",
    "Custom Elements Manifest\u3092\u63D0\u4F9B\u3057\u307E\u3059\u3002",
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
  const server = buildMcpServer(package_default.version);
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
export {
  main
};
