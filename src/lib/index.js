import * as svelte from "svelte/compiler";
import { capitalize, getName } from "./util.js";
import { findCustomProperties, parseCssDoc } from "./css.js";
import { findDescription, findSlots, getSlotDocs } from "./html.js";
import { findExportedVars, getJsDoc } from "./javscript";
import fs from "fs";
import { locationFromOffset } from "./location.js";
import parser from "css-tree/lib/parser";
import path from "path";

const DOCS_QUERY_RE = /.*(?=:docs)\b/;
const docsImport = (id) => DOCS_QUERY_RE.exec(id);

export default function parse() {
    return {
        enforce: "pre",
        resolveId(id, importer) {
            if (docsImport(id)) {
                /**
                 * Vite dev mode?
                 * id: '/path/component.svelte:docs'
                 * importer: '/home/user/project/index.html'
                 */
                if (importer?.endsWith(".html")) {
                    const dir = path.dirname(importer);
                    return path.join(dir, id);
                // eslint-disable-next-line brace-style
                }
                /**
                 * JS Import
                 * id: './component.svelte:docs'
                 * importer: '/home/user/project/path/docs.js'
                 */
                else if (id.startsWith("./")) {
                    const dir = path.dirname(importer);
                    return path.resolve(dir, id);
                }

                /**
                 * Somebody else resolved it (e.g resolve.alias)
                 */
                return id;
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
        },
    };
}
