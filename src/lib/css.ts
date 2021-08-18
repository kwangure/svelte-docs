import * as comment from "comment-parser/es6";
import { getDocs } from "./comment.js";
import { serialize } from "stylis";

export function parseCssDoc(customProperties) {
    return customProperties.map(function useClosestJsDoc(property) {
        const { comments, ...rest } = property;
        for (let i = comments.length -1; i >= 0; i--) {
            const value = comments[i];
            if (value.startsWith("/**")) {
                rest.cssDoc = getDocs(comment.parse(value));
                break;
            }
        }
        return rest;
    });
}

export function getLeadingComments(index, siblings) {
    const leadingComments = [];

    for (let i = index - 1; i >= 0; i--) {
        const previousSibling = siblings[i];
        if (previousSibling && previousSibling.type === "comm") {
            leadingComments.push(previousSibling.value);
        } else {
            break;
        }
    }

    // Reverse to maintain CSS cascading order
    return leadingComments.reverse();
}

export function findCustomProperties(ast) {
    const customProperties = [];

    serialize(ast, function getCustomProperty(element, index, siblings) {
        const { children, type, value } = element;
        const isCustomProperty = type === "decl"
            && value.startsWith("--");

        if (isCustomProperty) {
            return customProperties.push({
                name: element.props,
                value: element.children,
                comments: getLeadingComments(index, siblings),
            });
        }

        if (Array.isArray(children)) {
            children.forEach((child, i, siblings) => {
                getCustomProperty(child, i, siblings);
            });
        }
    });

    return customProperties;
}
