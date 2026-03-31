# mdx-gun 🔫

A super-lightweight, zero-wrapper Web Component that lazily fetches, evaluates, and renders MDX files on demand using Preact. It features high-performance CSS hardware-accelerated animations for smooth transitions.

## ✨ Features

* **Renders In Browser**: Renders MDX code fully within the browser.
* **Flexible Fetching**: Picks up inline `<script type="text/mdx">` templates or looks for MDX files in the `src` attribute with a fallback to `${id}.mdx`.
* **State Cleanups**: Automatically unmounts and purges the Preact tree from the DOM after minimizing to prevent memory leaks.
* **Hash Routing Compatible**: Listens to URL hash changes natively to show or hide the component.

---

## 🚀 Installation & Usage

You can drop this directly into your HTML file. It handles imports from ESM networks like `esm.sh` right out of the box.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MDX Gun Example</title>

  <!-- The Necessary Script -->
  <script src="https://esm.sh/gh/rodezee/mdx-gun" type="module"></script>

  <!-- Optional Customized CSS -->
  <link rel="stylesheet" href="https://esm.sh/kartoncss/karton.min.css">

</head>
<body>

  <div id="top" style="text-align: center;">
    <a href="https://github.com/rodezee/mdx-gun" style="font-size: 50px;">GitHub ReadMe</a>
  </div>

  <a href="#hello-world">↓ Hello World ↓</a>

  <hr>

  <mdx-gun id="about-us" src="https://esm.sh/gh/rodezee/mdx-gun/about-us.mdx"></mdx-gun>
  <button onclick="document.getElementById('about-us').fire()">Fire</button>
  <button onclick="document.getElementById('about-us').kill()">Kill</button>

  <hr>

  <mdx-gun fire smoke id="intro" src="https://esm.sh/gh/rodezee/mdx-gun/intro.mdx"></mdx-gun>

  <hr>

  <mdx-gun fire smoke id="use-state-counter">
    <script type="text/mdx">
import { useState } from 'https://esm.sh/preact/hooks'

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}

# Another Live Counter
This one was created using a **Preact** hook **useState**, directly within the HTML
<Counter />  
    </script>
  </mdx-gun>

  <hr>

  <mdx-gun fire id="hello-world">
    <script type="text/mdx">
export function Thing() {
  return <>World</>
}

# Hello <Thing />

This `<mdx-gun ..>` does not "smoke" and stay,  
but disappears on `window.hash` change.
    </script>
  </mdx-gun>

  <hr>

  <a href="#top">↑ TOP ↑</a>

</body>
</html>```

----------

## ⚙️ How it Works

### Attributes

`src`

The path to the MDX file. If not specified, it safely falls back to `${id}.mdx`.

`id`

Used to associate with URL hashes (e.g., `#about-us`) to automatically fire the element, or fallback `src`.

`fire`

Adding this attribute immediately loads, evaluates, and transitions the element into view on mount.

`smoke`

Adding this attribute keeps the elements content in place even if the window.hash changes to another URL hash.

### Functions

`.fire()`

Loads, compiles, and smoothly transitions the MDX content into view.

`.kill()`

Triggers the close animation and purges the Preact tree from the DOM after `500ms`.


----------

## ⚛️ Using Preact Hooks in MDX

Because `mdx-gun` evaluates MDX natively in the browser without a traditional bundler (like Vite or Webpack), bare imports like `import { useState } from 'preact/hooks'` won't resolve on their own. 

You have two easy ways to use state and hooks inside your MDX files or templates:

### Method 1: Use Full URL Imports (Recommended)
The absolute easiest way to handle this is to use the full ESM CDN URL directly inside your MDX. It requires zero configuration on your website!

```markdown
import { useState } from 'https://esm.sh/preact/hooks'

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}

# Live Counter
<Counter />

```

### Method 2: Use Native Import Maps

If you prefer writing clean, bare imports like `from 'preact/hooks'`, you can add an [Import Map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) to the `<head>` of your HTML file:

```html

<script type="importmap">
{
  "imports": {
    "preact": "https://esm.sh/preact",
    "preact/hooks": "https://esm.sh/preact/hooks"
  }
}
</script>

```

Now, the browser will automatically resolve those clean imports inside your evaluated MDX files to the correct CDN URL!

