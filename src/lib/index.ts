import * as svelte from "svelte/compiler";
import { capitalize, getName } from "./util";
import { CustomPropertyDoc, findCustomProperties, parseCssDoc } from "./css";
import { ExportDoc, findExportedVars, getJsDoc } from "./javscript";
import { findDescription, findSlots, getSlotDocs, SlotDoc } from "./html";
import { compile } from "stylis";
import type { PreprocessorGroup } from "svelte/types/compiler/preprocess";

const styleRegExp = /(?:<\s*style[^>]*>)([^<]+)(?:<\/\s*style\s*>)/;

export type { CustomPropertyDoc as CSSPropertyDoc, ExportDoc, SlotDoc };

export interface Docs {
    /** The name of the component */
    name: string,

    /** The slots in markup */
    slots: SlotDoc[],

    /** The text description of the component */
    description: string,

    /** The exported variables in the regular `<script/>` tag */
    props: ExportDoc[],

    /** The exported variables in the `<script context="module"/>` tag */
    exports: ExportDoc[],

    /** The defined custom properties in a document */
    customProperties: CustomPropertyDoc[]
}

export type ParseOptions = {
    /** String content of a Svelte file. */
    code: string;

    /** If `name` is missing, it will be inferred from filename. */
    filename: string;

    /** Component name to be used in documentation. */
    name: string;

    /** Options passed to `svelte.preprocess()`. */
    preprocess: PreprocessorGroup | PreprocessorGroup[];
}

export default async function parse(options: ParseOptions): Promise<Docs> {
    let { filename, code, preprocess, name } = options;

    if (preprocess) {
        ({ code } = await svelte
            .preprocess(code, preprocess, { filename }));
    }

    const { html, instance, module } = await svelte.parse(code);
    const description = findDescription(html);
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

    const docs: Docs = {
        name: capitalize(getName(name, filename)),
        slots: getSlotDocs(slots),
        description,
        props: getJsDoc(props),
        exports: getJsDoc(exports),
        customProperties: parseCssDoc(customProperties),
    };

    return docs;
}
