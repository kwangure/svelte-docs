# Svelte Documentation Parser
Generate JSON documentation for Svelte components.

## Install
```bash
npm install @kwangure/svelte-docs
```

## Usage
```javascript
import fs from "fs";
import { parse } from "@kwangure/svelte-docs";
import path from "path";

const filename = path.resolve(process.cwd(), "./button.svelte");
const code = fs.readFileSync(filename, { encoding: "utf-8" })

const docs = await parse({
    name: "Button",
    filename,
    code,
    preprocess: sveltePreprocess({
        scss: {
            prependData: `@import 'src/styles/variables.scss';`
        },
        postcss: {
            plugins: [require('autoprefixer')()]
        }
    }),
});

console.log(docs);

```

## Parse options

The `code` option is required.

| Option                     | Description                                   |
|----------------------------|-----------------------------------------------|
| **filename**               | The filename of a Svelte component            |
| **code**                   | String content of a Svelte file               |
| **preprocess**             | Options passed to `svelte.preprocess()`       |
| **name**                   | Name to be included in documentation.         |
<br>

## Output

| Feature            | Description                                                |
|--------------------|------------------------------------------------------------|
| `name`             | Component's name                                           |
| `props`            | Props in the standard `<script>` tag                       |
| `exports`          | Exported values in the `<script context="module">` tag     |
| `customProperties` | A list of custom properties defined in the `<style>` tag   |
| `description`      | Component's description (Planned)                          |
| `slots`            | Component's description (Planned)                          |

## License

[MIT](/LICENSE)
