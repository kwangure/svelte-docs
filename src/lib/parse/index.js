import * as svelte from "svelte/compiler";
import { capitalize, getName } from "./util.js";
import { findCustomProperties, parseCssDoc } from "./css.js";
import { findDescription, findSlots, getSlotDocs } from "./html.js";
import { findExportedVars, getJsDoc } from "./javscript";
import { locationFromOffset } from "./location.js";
import parser from "css-tree/lib/parser";

export function parse(code, options) {
    const { filepath } = options;

    const { html, instance, module, css } = svelte.parse(code);

    const description = findDescription(html);
    const slots = findSlots(html);
    const props = findExportedVars(instance);
    const exports = findExportedVars(module);

    let customProperties = [];
    if (css) {
        const css_string = code
            .slice(css.content.start, css.content.end);
        // Use different css-tree parser since Svelte's ignores comments
        const ast = parser(css_string, {
            ...locationFromOffset(code, css.content.start),
            positions: true,
        });
        customProperties = findCustomProperties(ast);
    }

    const docs = {
        name: capitalize(getName(filepath)),
        slots: getSlotDocs(slots),
        description,
        workingDirectoryFilepath: filepath.replace(new RegExp(`^${process.cwd()}/`), ""),
        props: getJsDoc(props),
        exports: getJsDoc(exports),
        customProperties: parseCssDoc(customProperties),
    };

    return {
        code: `export default ${JSON.stringify(docs)};`,
    };
}
