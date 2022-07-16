import * as svelte from "svelte/compiler";
import { capitalize, getName } from "./util.js";
import { findCustomProperties, parseCssDoc } from "./css.js";
import { findDescription, findSlots, getSlotDocs } from "./html.js";
import { findExportedVars, getJsDoc } from "./javscript";
import fs from "fs";
import MagicString from "magic-string";
import parser from "css-tree/lib/parser";
import path from "path";

const DOCS_QUERY_RE = /.*(?=:docs)\b/;
const docsImport = (id) => DOCS_QUERY_RE.exec(id);

export default function parse() {
    return {
        enforce: "pre",
        resolveId(id, importer) {
            if (docsImport(id)) {
                const dir = path.dirname(importer);
                return path.join(dir, id);
            }
        },
        load(id) {
            const match = docsImport(id);
            if (match) {
                const [filepath] = match;
                return fs.readFileSync(filepath, "utf-8");
            }
        },
        transform(code, id) {
            const match = docsImport(id);
            if (!match) return;
            const [filepath] = match;

            const { html, instance, module, css } = svelte.parse(code);
            const magic_string = new MagicString(code);

            const description = findDescription(html);
            const slots = findSlots(html);
            const props = findExportedVars(instance);
            const exports = findExportedVars(module);

            let customProperties = [];
            if (css) {
                const css_string = code
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
                name: capitalize(getName(filepath)),
                slots: getSlotDocs(slots),
                description,
                props: getJsDoc(props),
                exports: getJsDoc(exports),
                customProperties: parseCssDoc(customProperties),
            };

            return {
                code: `export default ${JSON.stringify(docs)};`,
            };
        },
    };
}
