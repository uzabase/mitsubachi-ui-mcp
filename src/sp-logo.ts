import { z, ZodRawShape } from "zod";
import { html, nothing, TemplateResult } from "lit-html";
import { CustomElement } from "./manifest.js";
import { describe } from "./schema.js";

export function getSpLogoDefinition(
  customElement: CustomElement,
): [ZodRawShape, (shape: ZodRawShape) => TemplateResult] {
  const input = { language: z.enum(["ja", "en", "zh"]) };

  describe(input, customElement);

  return [
    input,
    ({ language }) => {
      return html`<sp-logo language=${language|| nothing }></sp-logo>`;
    },
  ];
}
