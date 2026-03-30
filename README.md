
# 🔫 MDX Gun

A lightweight, high-performance **Vanilla Web Component** that preloads, compiles, and renders MDX files dynamically in the browser. Powered by React, MDX @3, and esm.sh.

## ✨ Features

-   🚀 **Zero-Build MDX:** Compiles MDX strings directly in the browser. No Vite/Webpack build steps required.
    
-   ⚡ **Preloaded Fetching:** Fetches the `.mdx` content over the network as soon as the element connects to the DOM, but defers rendering until triggered.
    
-   📏 **Smart Auto-Sizing:** Uses a `ResizeObserver` with a safe pixel buffer to ensure dynamic content and late-loading text never get cut off during CSS transitions.
    
-   🔗 **URL Hash Routing:** Can automatically fire and expand based on the page's `#` hash matching the component's `id`.
    

----------

## 🚀 Quick Start

### 1. The Markup

Add the custom element to your HTML. You can specify the file via `src` or use the `id` as a fallback.

HTML

```
<mdx-gun fire src="intro.mdx"></mdx-gun>

<mdx-gun id="hello-world"></mdx-gun>

<button onclick="document.getElementById('about-us').fire()">Open About Us</button>
<mdx-gun id="about-us"></mdx-gun>

```

### 2. The Implementation

Simply drop your finalized JS file as an ES module:

HTML

```
<script src="mdx-gun.js" type="module" defer></script>

```

----------

## ⚙️ How it Works under the Hood

1.  **`connectedCallback()`**: Captures the intended source and immediately calls `preloadMdx()`.
    
2.  **`preloadMdx()`**: Pulls the raw text and sets a `loading` attribute. Dispatches a custom `loaded` event when finished.
    
3.  **`fire()`**: If the file is still loading when requested, it registers a `{ once: true }` listener for the `loaded` event. Otherwise, it calls `run()`.
    
4.  **`run()`**: Hands off the fetched string to `@mdx-js/mdx` evaluated at runtime. React mounts the generated tree inside a measured wrapper.
