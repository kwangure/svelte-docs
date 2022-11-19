import { capitalize, getName } from "../helpers/util.js";
import { findCustomProperties, parseCssDoc } from "../helpers/css.js";
import { dataToEsm } from "@rollup/pluginutils";
import { findDescription } from "../helpers/svelte.js";
import parser from "css-tree/lib/parser";

export function css(code, options) {
    const { filepath } = options;

    // Use different css-tree parser since Svelte's ignores comments
    const ast = parser(code, { positions: true });
    const customProperties = findCustomProperties(ast);

    const docs = {
        name: capitalize(getName(filepath)),
        description: findDescription(code),
        workingDirectoryFilepath: filepath.replace(new RegExp(`^${process.cwd()}/`), ""),
        customProperties: parseCssDoc(customProperties),
    };

    return {
        code: dataToEsm(docs),
    };
}
