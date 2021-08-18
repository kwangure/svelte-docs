import * as comment from "comment-parser/es6";
import * as svelte from "svelte/compiler";
import { getDocs } from "./comment.js";
import type { INode } from "svelte/types/compiler/compile/nodes/interfaces";
import type CustomElementSlot from "svelte/types/compiler/compile/nodes/Slot";
import type DefaultSlotTemplate from "svelte/types/compiler/compile/nodes/DefaultSlotTemplate";
import type Element from "svelte/types/compiler/compile/nodes/Element";
import type Head from "svelte/types/compiler/compile/nodes/Head";

type Slot = Omit<CustomElementSlot, "type"> & {
    type: "Element"| "Slot",
};

type SvelteNode = INode | Slot;
type ParentNode = DefaultSlotTemplate | Element | Head;

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
            // eslint-disable-next-line id-denylist
            leadingComments.push(data.trim());
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
            enter(node: SvelteNode, parent: ParentNode, _, index) {
                if (node.type === "Slot") {
                    const siblings = parent?.children || [];
                    // TODO: Revert typing back to `Attribute`. Waiting for tests.
                    const name = node.attributes.find((a) => a.name === "name") as any;
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
            enter(node: SvelteNode) {
                if (!description && node.type === "Comment") {
                    const comment = node.data.trim();
                    if (comment.startsWith(tag)) {
                        description = comment.substring(tag.length).trim();
                    }
                }
            },
        });
    }

    return description;
}
