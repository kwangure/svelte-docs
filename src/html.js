import * as comment from "comment-parser";
import * as svelte from "svelte/compiler";
import { getDocs } from "./comment.js";

export function parseHtmlDoc(slots) {
    return slots.map(function useClosestHtmlDoc(property) {
        const { comments, ...rest } = property;
        for (let i = comments.length -1; i >= 0; i--) {
            const value = comments[i];
            if (value.startsWith("*")) {
                rest.htmlDoc = getDocs(comment.parse(`/*${value}*/`));
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
        if (!previousSibling) break;
        // eslint-disable-next-line id-denylist
        const { data, type } = previousSibling;
        const isWhitespace = (/^\s+$/).test(data);
        if (isWhitespace) continue;
        if (type === "Comment") {
            leadingComments.push(data);
        } else {
            break;
        }
    }

    // Reverse to maintain CSS cascading order
    return leadingComments.reverse();
}


export function findSlots(ast) {
    const slots = [];

    if (ast) {
        svelte.walk(ast, {
            // eslint-disable-next-line max-params
            enter(node, parent, _, index) {
                if (node.type === "Slot") {
                    const siblings = (parent && parent.children) || [];
                    slots.push({
                        name: node.attributes.find((a) => a.name === "name")
                            || "default",
                        comments: getLeadingComments(index, siblings),
                    });
                }
            },
        });
    }

    return slots;
}
