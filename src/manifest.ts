import custom from 'mitsubachi-ui/custom-elements.json' with { type: 'json' };

export interface Manifest {
  get customElements(): { [tag: string]: CustomElement };
}

export interface CustomElement {
  tagName: string;
  /**
   * 
   */
  stringify(): string;
}

class CustomElementJson implements CustomElement {
  private raw: any;

  constructor(raw: any) {
    this.raw = raw;
  }

  get tagName(): string {
    return this.raw.tagName;
  }

  stringify(): string {
    return JSON.stringify(this.raw);
  }

}

class ManifestJson implements Manifest {
  private readonly raw: any;

  constructor(raw: any) {
    this.raw = raw;
  }
  /**
   * sp-ではじまる名前のWeb Componentを返します。
   */
  get customElements(): { [tag: string]: CustomElement } {
    const results: { [tag: string]: CustomElement } = {};
    for (const module of this.modules) {
      const declarations = module["declarations"];
      const customElements = declarations.filter(
        (d: any) => d.customElement && d.tagName.startsWith("sp-"),
      );
      for (const customElement of customElements) {
        const c = new CustomElementJson(customElement);
        results[c.tagName] = c;
      }
    }
    return results;
  }

  private get modules(): any[] {
    return this.raw["modules"];
  }
}
/**
 * 
 */
function loadManifest(manifestJson: any): Manifest {
  return new ManifestJson(manifestJson);
}

/**
 *
 */
export function loadDefaultManifest(): Manifest {
  return loadManifest(custom);
}
