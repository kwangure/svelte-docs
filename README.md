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
const code = fs.readFileSync(filename, { encoding: "utf-8" });

const docs = await parse({
    name: "Button",
    filename,
    code,
    preprocess: sveltePreprocess({
        postcss: {
            plugins: [require('autoprefixer')()]
        }
    }),
});

console.log(docs);

```

## Parse options

The `code` option is required.

| Option                     | Description                                            |
|----------------------------|--------------------------------------------------------|
| **name**                   | Name to be included in documentation.                  |
| **filename**               | If name is missing, it will be inferred from filename. |
| **code**                   | String content of a Svelte file.                       |
| **preprocess**             | Options passed to `svelte.preprocess()`.               |
<br>

## Output

| Feature            | Description                                                |
|--------------------|------------------------------------------------------------|
| `name`             | Component's name                                           |
| `slots`            | Component's slots                                          |
| `description`      | Component's description                                    |
| `props`            | Exported values in the standard `<script>` tag             |
| `exports`          | Exported values in the `<script context="module">` tag     |
| `customProperties` | A list of custom properties defined in the `<style>` tag   |

## Documentation Parsing

Only comments that begin with `*` are parsed as documentation. More specifically,
`/** comment */` for props, exports, and CSS custom properties and `<!--* comment -->`
for slots.

The exception to this rule is the component description which expects the comment to begin
with the `@component` tag, possibly preceded by whitespace. This matches
[`Svelte for VS Code`'s syntax](https://github.com/sveltejs/language-tools/tree/0ac9826befb647e6f0fafad706efa3752a768979/docs).

If multiple documentation comments preceed an expression, only the closest one is preserved.

### Example:
```html
<!--
    @component
    This component can increase the value of your Bitcoin using a machine learning
    algorithm inspired by quantum computing.
-->
<script>
    import sendToPapa from "./harmless.js";
    /** valid but ignored comment */
    /**
     * The wealth you want multiplied!
     * @type {string}
     */
    /* ignored comment */
    export let bitcoinAddress;

    sendToPapa(bitcoinAddress);
</script>

<div class="liar-liar">
    <h1>Become a billionaire in 16 months, guaranteed!<h1>
    <p>
        You know we're not scammers because we take 16 months.
    </p>
</div>

<!--* Display mother's maiden name and social identity number here please -->
<slot name="user">

<style>
    .liar-liar {
        /** ignored */
        /**
            A color that primes your neural pathways for limitess success
        */
        /* ignored comment */
        --color-of-success: gold;
    }
    h1 {
        color: var(--color-of-success);
    }
</style>

```

## License

[MIT](/LICENSE)
