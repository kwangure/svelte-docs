import * as comment from "comment-parser/es6";
import { findReverse } from "./util.js";
import { getDocs } from "./comment.js";
import walk from "css-tree/lib/walker";

export function parseCssDoc(customProperties) {
    return customProperties.map(function useClosestJsDoc(property) {
        const { comments, ...rest } = property;
        const value = findReverse(comments, (c) => c.startsWith("/**"));
        return Object.assign(rest, {
            cssDoc: value ? getDocs(comment.parse(value)) : null,
        });
    });
}

function isRule(node) {
    return node.type === "Rule";
}

function isPseudoSelector(node) {
    return node.type === "PseudoClassSelector";
}

function isDeclaration(node) {
    return node.type === "Declaration";
}

const allowed_pseudoselectors = new Set(["root", "host", "export"]);
function getCustomPropertyExport(prelude) {
    let exportSelector = "";
    walk(prelude, (node) => {
        if (isPseudoSelector(node) && allowed_pseudoselectors.has(node.name)) {
            exportSelector = node.name;
        }
    });
    return exportSelector;
}

function getValue(node) {
    if (node.type === "Raw") {
        return node.value;
    }
    // TODO: Do we need to handle `Value`?
    return "";
}

function getComments(node) {
    const comments = [];

    while (node !== null && node.data.type === "Comment") {
        comments.push(`/*${node.data.value}*/`);
        node = node.prev;
    }

    return comments;
}

function getExports(block) {
    const customProperties = [];
    walk(block, (node, parent) => {
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

export function findCustomProperties(ast) {
    const result = {
        customProperties: [],
    };

    walk(ast, (node) => {
        if (!isRule(node)) return;
        const selector = getCustomPropertyExport(node.prelude);
        if (!selector) return;

        Object.assign(result, {
            selector,
            customProperties: getExports(node.block),
            end: node.loc.end.offset,
            start: node.loc.start.offset,
        });
    });

    return result;
}
