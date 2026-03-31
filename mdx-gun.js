import { evaluate } from 'https://esm.sh/@mdx-js/mdx@3?bundle'
import * as runtime from 'https://esm.sh/react/jsx-runtime'
import React from 'https://esm.sh/react'
import ReactDOM from 'https://esm.sh/react-dom/client'
import remarkGfm from 'https://esm.sh/remark-gfm@4?bundle'

class MdxGun extends HTMLElement {
  constructor() {
    super();
    this.injectStyles();
    this.cachedRawText = null;
  }

  injectStyles() {
    if (document.getElementById('mdx-gun-css')) return;
    const style = document.createElement('style');
    style.id = 'mdx-gun-css';
    style.textContent = `
      mdx-gun {
        display: block;
        opacity: 0;
        transform: translateY(10px);
        max-height: 0;
        overflow: hidden;
        visibility: hidden;
        transition: opacity 0.5s ease, transform 0.5s ease, max-height 0.6s ease-in-out;
      }
      mdx-gun[fired] {
        opacity: 1;
        transform: translateY(0);
        visibility: visible;
        height: auto;
      }
    `;
    document.head.append(style);
  }

  connectedCallback() {
    // Obtain MDX source
    this.src = this.getAttribute('src') || (this.id ? `${this.id}.mdx` : null);
    if (this.src) {
      // Immediately fetch/load the MDX file into memory
      this.preloadMdx();    
    } else {
      // Fallback to load from possible inline-script within this element
      const inline = this.querySelector('script');
      if (inline) {
        this.cachedRawText = inline.innerHTML;
      } else {
        // Nothing found! Warn!
        console.warn("Both 'src' and 'id' are unset, also no <template> found, so unable to obtain the MDX source for:", this);
        return;      
      }
    }

    // Add addEventListner and checkHash right now
    window.addEventListener('hashchange', () => this.checkHash());
    this.checkHash();
    // Auto Fire on load when fire attribute is specified
    if (this.hasAttribute('fire')) this.fire();
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
    if (this.id && currentHash === this.id) {
      this.fire();
    } else if (this.hasAttribute('fired') && !this.hasAttribute('fire')) {
      this.removeAttribute('fired');
      setTimeout(() => { if (!this.hasAttribute('fired')) this.root?.render(null); }, 2600);
    }
  }

async run() {
    try {
      const { default: Content } = await evaluate(this.cachedRawText, {
        ...runtime,
        remarkPlugins: [remarkGfm],
        development: false 
      });
      console.log("JSX evaluated", this);
      if (!this.root) this.root = ReactDOM.createRoot(this);

      const Wrapper = () => {
        const contentRef = React.useRef(null);

        React.useEffect(() => {
          if (!contentRef.current) return;

          // 1. Create a Resize Observer to watch for any size changes
          const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
              // Get the EXACT current height of the content
              const height = entry.target.scrollHeight + 40;
              this.style.maxHeight = `${height}px`;
            }
          });

          // 2. Start observing the wrapper div
          resizeObserver.observe(contentRef.current);

          // 3. Trigger the animation to start
          requestAnimationFrame(() => {
            this.setAttribute('fired', '');
          });

          // 4. Cleanup the observer if the React component unmounts
          return () => resizeObserver.disconnect();
        }, []);

        // Wrap the content in a div so we can measure it
        return React.createElement('div', { ref: contentRef }, React.createElement(Content));
      };

      this.root.render(React.createElement(Wrapper));
      
    } catch (error) {
      console.error("Mdx-Gun fail to evaluate:", error);
    }  
  }

  fire() {
    if (this.hasAttribute('fired')) return;
    
    // Fallback in case it tries to fire before the preload finished fetching
    if (!this.cachedRawText && this.hasAttribute('loading') ) {
      this.addEventListener("loaded", () => this.run(), { once: true });
    } else {
      this.run();
    }
  }
}

customElements.define('mdx-gun', MdxGun);
