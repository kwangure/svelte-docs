# Svelte Documentation Parser
Generate JSON documentation for Svelte components.

This is a fork of [sveltedoc-parser](https://github.com/alexprey/sveltedoc-parser). This fork adds curious features I currently need. Choose wisely.

## Install
```bash
npm install @kwangure/svelte-docs
```

## Usage
```javascript
import { parse } from "@kwangure/svelte-docs";

const options = {
    filename: "./button.svelte",
    encoding: "ascii",
    features: ["data", "computed", "methods"],
    ignoredVisibilities: ["private"],
    includeSourceLocations: true,
    version: 3
};
const docs = await parse(options);

console.log(docs);

```

## Parse options

The `options` object passed to the `parse` function ***must include*** `filename` or `fileContent`.

Here are the properties supported by `options`.

<!-- TODO: investigate whether encoding is really needed -->
| Option                     | Description                                   | Type     | Default value |
|----------------------------|-----------------------------------------------|----------|---------------|
| **filename**               | The filename of a Svelte component            | string   |
| **fileContent**            | Contect of a Svelte file content              | string   |             |
| **encoding**               | The file encoding.                            | string   | `"utf8"` |
| **features**               | Component features to extract.                | string[] | [All supported features](#Supported-feature-names) |
| **ignoredVisibilities**    | These visibilities wont be included in output | string[] | `["private", "protected"]` |
| **includeSourceLocations** | Whether to inlude source locations            | boolean | `false` |

### Supported feature names

These are the values that can be included in the `options.features` array:

| Feature       | Description                                           |
|---------------|-------------------------------------------------------|
| `name`        | Component"s name                                      |
| `description` | Component"s description                               |
| `keywords`    | List of JSDoc keywords found in the top level comment |
| `components`  | List of imported components                           |
| `computed`    | List of computed properties                           |
| `data`        | List of data properties (Component"s props)           |
| `events`      | List of events fired/dispatched by this component     |
| `methods`     | List of methods                                       |
| `refs`        | List of references used by this component             |
| `slots`       | List of slots provided by this component              |

## License

[MIT](/LICENSE)
