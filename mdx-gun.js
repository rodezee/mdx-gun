import { evaluate } from 'https://esm.sh/@mdx-js/mdx@3?bundle'
import * as runtime from 'https://esm.sh/preact/jsx-runtime'
import { h, render } from 'https://esm.sh/preact'
import { useEffect, useRef, useState } from 'https://esm.sh/preact/hooks'
import remarkGfm from 'https://esm.sh/remark-gfm@4?bundle'

class MdxGun extends HTMLElement {
  constructor() {
    super();
    this.injectStyles();
    this.cachedRawText = null;
    this.triggerInternalKill = null;
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
        transition: opacity 0.5s ease, transform 0.5s ease, max-height 0.6s ease-in-out;
      }
      mdx-gun[fired] {
        opacity: 1;
        transform: translateY(0);
        /* Let JS handle the max-height */
      }
    `;
    document.head.append(style);
  }

  connectedCallback() {
    this.src = this.getAttribute('src') || (this.id ? `${this.id}.mdx` : null);
    if (this.src) {
      this.preloadMdx();    
    } else {
      const inline = this.querySelector('script');
      if (inline) {
        this.cachedRawText = inline.innerHTML.trim();
      } else {
        console.warn("'src' and 'id' are unset, also no <script \"text/mdx\"> found, unable to obtain the MDX source for:", this);
        return;      
      }
    }

    window.addEventListener('hashchange', () => this.checkHash());
    this.checkHash();
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
      this.kill();
    }
  }

  async run() {
    try {
      const { default: Content } = await evaluate(this.cachedRawText, {
        ...runtime,
        remarkPlugins: [remarkGfm],
        development: false 
      });

      const Wrapper = () => {
        const contentRef = useRef(null);
        const [visible, setVisible] = useState(true);

        useEffect(() => {
          if (!contentRef.current) return;

          const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
              const height = entry.target.scrollHeight + 40;
              // Only update max-height dynamically if it's currently expanding/expanded
              if (this.hasAttribute('fired')) {
                this.style.maxHeight = `${height}px`;
              }
            }
          });

          resizeObserver.observe(contentRef.current);

          requestAnimationFrame(() => {
            this.setAttribute('fired', '');
          });

          this.triggerInternalKill = () => {
            setVisible(false);
          };

          return () => {
            resizeObserver.disconnect();
            this.triggerInternalKill = null;
          };
        }, []);

        return h('div', { 
          ref: contentRef,
          style: {
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.4s ease', // Fades out slightly faster than the box closes
          }
        }, h(Content));
      };

      render(h(Wrapper), this);
      
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
    if (this.hasAttribute('fired')) {
      // 1. Tell Preact to fade out the text
      if (this.triggerInternalKill) {
        this.triggerInternalKill();
      }

      // 2. Grab the current computed pixel height
      const currentHeight = this.scrollHeight;
      
      // 3. Lock it in so the browser has a clear starting number to animate from
      this.style.maxHeight = `${currentHeight}px`;
      
      // 4. Force a tiny DOM recalculation so the browser registers the locked height
      void this.offsetHeight; 

      // 5. Tell it to shrink to 0px and start the CSS animation
      this.style.maxHeight = '0px';
      this.removeAttribute('fired');
    }

    // 6. Wait for the 0.6s CSS transition to fully finish before purging memory!
    setTimeout(() => { 
      if (!this.hasAttribute('fired')) {
        render(null, this); 
        this.style.maxHeight = ''; 
      }
    }, 600);
  }
}

customElements.define('mdx-gun', MdxGun);
