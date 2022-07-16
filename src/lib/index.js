import * as svelte from "svelte/compiler";
import { capitalize, getName } from "./util.js";
import { findCustomProperties, parseCssDoc } from "./css.js";
import { findDescription, findSlots, getSlotDocs } from "./html.js";
import { findExportedVars, getJsDoc } from "./javscript";
import MagicString from "magic-string";
import parser from "css-tree/lib/parser";

export default function parse() {
    const s = JSON.stringify;
    return {
        markup(input) {
            const docs_regex = /export +const +docs *= *true *;*/;
            const { filename, content } = input;

            const { html, instance, module, css } = svelte.parse(content);
            if (!module) return;

            const magic_string = new MagicString(content);
            const module_string = magic_string.slice(module.start, module.end);
            const docs_variable = docs_regex.exec(module_string);
            if (!docs_variable) return;

            const description = findDescription(html);
            const slots = findSlots(html);
            const props = findExportedVars(instance);
            const exports = findExportedVars(module);

            let customProperties = [];
            if (css) {
                const css_string = magic_string
                    .slice(css.content.start, css.content.end);
                // Use different css-tree parser since Svelte's ignores comments
                const ast = parser(css_string, { positions: true });
                const cssExport = findCustomProperties(ast);
                if (cssExport.start !== undefined) {
                    ({ customProperties } = cssExport);
                    if (cssExport.selector === "export") {
                        const export_start
                            = css.content.start + cssExport.start;
                        const export_end = css.content.start + cssExport.end;
                        magic_string.remove(export_start, export_end);
                    }
                }
            }

            const docs = {
                name: capitalize(getName(filename)),
                slots: getSlotDocs(slots),
                description,
                props: getJsDoc(props),
                exports: getJsDoc(exports),
                customProperties: parseCssDoc(customProperties),
            };

            // Stringify twice to escape strings inside first string.
            const docs_string = `export const docs = JSON.parse(${s(s(docs))});`;

            const { 0: { length }, index } = docs_variable;
            const docs_start = module.start + index;
            const docs_end = module.start + index + length;
            magic_string.overwrite(docs_start, docs_end, docs_string);

            return {
                code: magic_string.toString(),
                map: magic_string.generateMap(),
            };
        },
    };
}
