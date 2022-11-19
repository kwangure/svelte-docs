import { css } from "./parse/css";
import fs from "fs";
import path from "path";
import { svelte } from "./parse/svelte";

const DOCS_QUERY_RE = /.*(?=:docs)\b/;
const docsImport = (id) => DOCS_QUERY_RE.exec(id);

export function plugin() {
    return {
        enforce: "pre",
        resolveId(id, importer) {
            if (docsImport(id)) {
                if (importer?.endsWith(".html")) {
                    /**
                     * We probably got here through Vite dev mode?
                     * id: '/path/component.svelte:docs'
                     * importer: '/home/user/project/index.html'
                     */
                    const dir = path.dirname(importer);
                    return path.join(dir, id);
                } else if (id.startsWith(".")) {
                    /**
                     * We probably got here via JS import
                     * id: './component.svelte:docs'
                     * importer: '/home/user/project/path/docs.js'
                     */
                    const dir = path.dirname(importer);
                    return path.resolve(dir, id);
                }

                /**
                 * Somebody else resolved it? (e.g resolve.alias)
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

            if (filepath.endsWith(".svelte")) {
                return svelte(code, { filepath });
            } else if (filepath.endsWith(".css")) {
                return css(code, { filepath });
            }
        },
    };
}
