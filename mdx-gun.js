import { evaluate } from 'https://esm.sh/@mdx-js/mdx@3?bundle'
import * as runtime from 'https://esm.sh/preact/jsx-runtime'
import { h, render } from 'https://esm.sh/preact'
import remarkGfm from 'https://esm.sh/remark-gfm@4?bundle'

class MdxGun extends HTMLElement {
  constructor() {
    super();
    this.cachedRawText = null;
    this.boundCheckHash = this.checkHash.bind(this);
  }

  injectStyles() {
    if (document.getElementById('mdx-gun-css')) return;
    const style = document.createElement('style');
    style.id = 'mdx-gun-css';
    style.textContent = `
      mdx-gun {
        display: block;
        opacity: 0;
        transform: translateY(10px) scaleY(0);
        transform-origin: top;
        overflow: hidden;
        transition: opacity 0.4s ease, transform 0.5s ease-in-out;
      }
      mdx-gun[fired] {
        opacity: 1;
        transform: translateY(0) scaleY(1);
      }
    `;
    document.head.append(style);
  }

  connectedCallback() {
    this.injectStyles();
    
    // 1. Check for an inline script template FIRST
    const inline = this.querySelector('script[type="text/mdx"]');
    
    if (inline) {
      this.cachedRawText = inline.innerHTML.trim();
    } else {
      // 2. Fall back to checking for a source attribute or ID
      this.src = this.getAttribute('src') || (this.id ? `${this.id}.mdx` : null);
      
      if (this.src) {
        this.preloadMdx();    
      } else {
        console.warn("No <script type=\"text/mdx\"> found, and 'src' or 'id' are unset. Unable to obtain MDX source for:", this);
        return;      
      }
    }
    
    window.addEventListener('hashchange', this.boundCheckHash);
    this.checkHash();
    if (this.hasAttribute('fire')) this.fire();
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this.boundCheckHash);
  }

  async preloadMdx() {
    try {
      this.setAttribute('loading', '');
      const response = await fetch(this.src);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.cachedRawText = await response.text();
      this.dispatchEvent(new CustomEvent("loaded"));
    } catch (error) {
      console.error(`Failed to preload MDX for ${this.src}:`, error);
    } finally {
      this.removeAttribute('loading');
    }
  }

  checkHash() {
    const currentHash = window.location.hash.substring(1);
    const isTarget = this.id && currentHash === this.id;

    if (isTarget) {
      this.fire();
    } else if (!isTarget && !this.hasAttribute('smoke')) {
      this.kill();
    }
  }

  async run() {
    try {
      const { default: Content } = await evaluate(this.cachedRawText, {
        ...runtime,
        remarkPlugins: [remarkGfm],
        development: false,
        baseUrl: import.meta.url
      });
      
      render(h(Content), this);

      requestAnimationFrame(() => {
        this.setAttribute('fired', '');
      });
      
    } catch (error) {
      console.error("Mdx-Gun fail to evaluate:", error);
    }  
  }

  fire() {
    if (this.hasAttribute('fired')) return;
    
    if (!this.cachedRawText && this.hasAttribute('loading') ) {
      this.addEventListener("loaded", () => this.run(), { once: true });
    } else {
      this.run();
    }
  }

  kill() {
    this.removeAttribute('fired');

    setTimeout(() => { 
      if (!this.hasAttribute('fired')) {
        render(null, this); 
      }
    }, 500);
  }
}

customElements.define('mdx-gun', MdxGun);
