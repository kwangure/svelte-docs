import * as comment from "comment-parser";
import * as svelte from "svelte/compiler";
import { getDocs } from "./comment.js";

export function getSlotDocs(slots) {
    return slots.map(function useClosestHtmlDoc(property) {
        const { comments, name } = property;
        const doc = { name, htmlDoc: null };
        for (let i = comments.length - 1; i >= 0; i--) {
            const value = comments[i];
            if (value.startsWith("*")) {
                doc.htmlDoc = getDocs(comment.parse(`/*${value}*/`));
                break;
            }
        }
        return doc;
    });
}

export function getLeadingComments(index, siblings) {
    const leadingComments = [];

    for (let i = index - 1; i >= 0; i--) {
        const previousSibling = siblings[i];
        if (!previousSibling) break;

        // Allow whitespace after comment
        const isWhitespace = previousSibling.type === "Text"
            && (/^\s+$/).test(previousSibling.data);
        if (isWhitespace) continue;

        if (previousSibling.type !== "Comment") break;
        leadingComments.push(previousSibling.data.trim());
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
                    const siblings = /** @type {any} */ (parent)?.children
                        || [];
                    // TODO: Revert typing back to `Attribute`. Waiting for tests.
                    const name = /** @type {any} */ (node).attributes.find((a) => a.name === "name");
                    const slot = {
                        name: name?.value[0].data || "default",
                        comments: getLeadingComments(index, siblings),
                    };
                    slots.push(slot);
                }
            },
        });
    }

    return slots;
}

export function findDescription(ast) {
    let description = "";

    if (ast) {
        const tag = "@component";
        svelte.walk(ast, {
            enter(node) {
                if (!description && node.type === "Comment") {
                    const comment = /** @type {any} */ (node).data.trim();
                    if (comment.startsWith(tag)) {
                        description = comment.substring(tag.length).trim();
                    }
                }
            },
        });
    }

    return description;
}
