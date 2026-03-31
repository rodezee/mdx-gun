
# 🔫 MDX Gun

A lightweight, high-performance **Vanilla Web Component** that preloads, compiles, and renders MDX files dynamically in the browser. Powered by React, MDX @3, and esm.sh.

## ✨ Features

-   🚀 **Zero-Build MDX:** Compiles MDX strings directly in the browser. No Vite/Webpack build steps required.
    
-   📦 **Flexible Sourcing:** Load MDX from an external file via attributes, or write it directly inside the HTML using a scoped `<script>` tag.
    
-   ⚡ **Preloaded Fetching:** Fetches external `.mdx` content over the network as soon as the element connects to the DOM, but defers execution until triggered.
    
-   📏 **Smart Auto-Sizing:** Uses a `ResizeObserver` with a safe pixel buffer to ensure dynamic content and late-loading text never get cut off during CSS transitions.
    
-   🔗 **URL Hash Routing:** Can automatically fire and expand based on the page's `#` hash matching the component's `id`.
    

----------

## 🚀 Quick Start

### 1. External MDX Files

You can specify the file via `src` or use the `id` as a fallback (which will assume `id.mdx`).

HTML

```
<mdx-gun fire src="intro.mdx"></mdx-gun>

<mdx-gun id="hello-world"></mdx-gun>

<button onclick="document.getElementById('about').fire()">Open About</button>
<mdx-gun id="about"></mdx-gun>

```

### 2. Inline MDX (New!)

For fast prototyping or single-file setups, you can place a `<script type="text/mdx">` directly inside the component. The browser will ignore it as standard JS, and `mdx-gun` will evaluate it!

HTML

```
<mdx-gun fire>
  <script type="text/mdx">
    export function Where() {
      return <>From</>
    }

    # <Where /> Inline Template
    This content didn't need an external file!
  </script>
</mdx-gun>

```

### 3. The Implementation

Simply drop your finalized JS file as an ES module:

HTML

```
<script src="mdx-gun.js" type="module" defer></script>

```

----------

## ⚙️ How it Works under the Hood

1.  **`connectedCallback()`**: Captures the intended source. If a `src` or `id` is present, it calls `preloadMdx()`. Otherwise, it attempts to pluck the `innerHTML` out of an internal `<script>` tag and trims it.
    
2.  **`preloadMdx()`**: Pulls the raw text of an external file and sets a `loading` attribute. Dispatches a custom `loaded` event when finished.
    
3.  **`fire()`**: If an external file is still loading when requested, it registers a `{ once: true }` listener for the `loaded` event. Otherwise, it calls `run()`.
    
4.  **`run()`**: Hands off the extracted/fetched string to `@mdx-js/mdx` evaluated at runtime. React mounts the generated tree inside a measured wrapper, while a `ResizeObserver` forces the container's `max-height` to scale appropriately to prevent text-clipping.

