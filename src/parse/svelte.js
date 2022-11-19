import { capitalize, getName } from "../helpers/util.js";
import { findCustomProperties, parseCssDoc } from "../helpers/css.js";
import { findDescription, findSlots, getSlotDocs } from "../helpers/svelte.js";
import { findExportedVars, getJsDoc } from "../helpers/javscript.js";
import { dataToEsm } from "@rollup/pluginutils";
import { locationFromOffset } from "../helpers/location.js";
import { parse } from "svelte/compiler";
import { parse as parseCss } from "css-tree";

export function svelte(code, options) {
    const { filepath } = options;

    const { html, instance, module, css } = parse(code);

    const description = findDescription(html);
    const slots = findSlots(html);
    const props = findExportedVars(instance);
    const exports = findExportedVars(module);

    let customProperties = [];
    if (css) {
        const css_string = code
            .slice(css.content.start, css.content.end);
        // Use different css-tree parser since Svelte's ignores comments
        const ast = parseCss(css_string, {
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
        code: dataToEsm(docs),
    };
}
