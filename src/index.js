import * as svelte from "svelte/compiler";
import { findCustomProperties, parseCssDoc } from "./css.js";
import { findExportedVars, parseJsDoc } from "./javscript.js";
import { findSlots, parseHtmlDoc } from "./html.js";
import capitalize from "just-capitalize";
import { compile } from "stylis";
import { getName } from "./util.js";

// eslint-disable-next-line prefer-named-capture-group
const styleRegExp = /(?:<\s*style[^>]*>)([^<]+)(?:<\/\s*style\s*>)/;

// TODOS:
//  - Parse component description
export default async function parse(options) {
    let { filename, code, preprocess, name } = options;

    if (preprocess) {
        ({ code } = await svelte
            .preprocess(code, preprocess, { filename }));
    }

    const { html, instance, module } = await svelte.parse(code);
    const slots = findSlots(html);
    const props = findExportedVars(instance);
    const exports = findExportedVars(module);

    // Use different CSS parser since Svelte uses CSSTree which ignores
    // comments by default
    const match = styleRegExp.exec(code);
    let customProperties = [];
    if (match) {
        customProperties = findCustomProperties(compile(match[1]));
    }

    const docs = {
        name: capitalize(getName(name, filename)),
        slots: parseHtmlDoc(slots),
        props: parseJsDoc(props),
        exports: parseJsDoc(exports),
        customProperties: parseCssDoc(customProperties),
    };

    return docs;
}
