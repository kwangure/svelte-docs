import * as comment from "comment-parser/es6";
import cssProperties from "mdn-data/css/properties.json";
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

function isIdentifier(node) {
    return node.type === "Identifier";
}

function isDeclaration(node) {
    return node.type === "Declaration";
}

function getCustomProperty(value) {
    let exportSelector = "";
    walk(value, (node) => {
        if (isIdentifier(node) && node.name.startsWith("--")) {
            exportSelector = node.name;
        }
    });
    return exportSelector;
}

function getComments(node) {
    const comments = [];

    while (node !== null && node.data.type === "Comment") {
        comments.push(`/*${node.data.value}*/`);
        node = node.prev;
    }

    return comments;
}

export function findCustomProperties(ast) {
    const customProperties = [];

    walk(ast, (node, parent) => {
        if (!isDeclaration(node)) return;
        const { loc: { end, start }, property, value } = node;
        // Custom property declaration
        if (property.startsWith("--")) return;
        const customProperty = getCustomProperty(value);
        if (!customProperty) return;

        const comments = getComments(parent.prev);
        const { syntax, mdn_url: mdnUrl } = cssProperties[property];
        customProperties.push({
            comments,
            customProperty,
            end,
            location:
            mdnUrl,
            property,
            start,
            syntax,
        });
    });

    return customProperties;
}
