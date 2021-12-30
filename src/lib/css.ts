import * as comment from "comment-parser/es6";
import type {
    Block,
    CssNode,
    Declaration,
    ListItem,
    PseudoClassSelector,
    Raw,
    Rule,
    StyleSheet,
    Value,
} from "css-tree";
import { Doc, getDocs } from "./comment";
import { findReverse } from "./util";
import walk from "css-tree/lib/walker";

export type CustomPropertyDoc = {
    cssDoc: Doc;
    property: string;
    value: string;
}

export function parseCssDoc(
    customProperties: CustomProperty[],
): CustomPropertyDoc[] {
    return customProperties.map(function useClosestJsDoc(property) {
        const { comments, ...rest } = property;
        const value = findReverse(comments, (c) => c.startsWith("/**"));
        return Object.assign(rest, {
            cssDoc: value ? getDocs(comment.parse(value)) : null,
        });
    });
}

interface CustomProperty {
    comments: string[];
    property: string;
    value: string;
}

function isRule(node: CssNode): node is Rule {
    return node.type === "Rule";
}

function isPseudoSelector(node: CssNode): node is PseudoClassSelector {
    return node.type === "PseudoClassSelector";
}

function isDeclaration(node: CssNode): node is Declaration {
    return node.type === "Declaration";
}

function hasCustomPropertyExport(prelude) {
    let hasExport = false;
    walk(prelude, (node) => {
        if (isPseudoSelector(node) && (node.name === "root" || node.name === "host")) {
            hasExport = true;
        }
    });
    return hasExport;
}

function getValue(node: Value | Raw): string {
    if (node.type === "Raw") {
        return node.value;
    }
    // TODO: Do we need to handle `Value`?
    return "";
}

function getComments(node: ListItem<CssNode>) {
    const comments: string[] = [];

    while (node !== null && node.data.type === "Comment") {
        comments.push(`/*${node.data.value}*/`);
        node = node.prev;
    }

    return comments;
}

function getExports(block: Block): CustomProperty[] {
    const customProperties: CustomProperty[] = [];
    walk(block, (node, parent: ListItem<CssNode>) => {
        if (isDeclaration(node) && node.property.startsWith("--")) {
            customProperties.push({
                property: node.property,
                value: getValue(node.value),
                comments: getComments(parent.prev),
            });
        }
    });
    return customProperties;
}

export function findCustomProperties(ast: StyleSheet): CustomProperty[] {
    const customProperties: CustomProperty[] = [];

    walk(ast, (node: CssNode) => {
        if (!isRule(node)) return;
        if (!hasCustomPropertyExport(node.prelude)) return;

        Object.assign(customProperties, getExports(node.block));
    });

    return customProperties;
}
