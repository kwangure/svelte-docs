import * as comment from "comment-parser/es6";
import * as svelte from "svelte/compiler";
import { Doc, getDocs } from "./comment";
import type CustomElementSlot from "svelte/types/compiler/compile/nodes/Slot";
import type DefaultSlotTemplate from
    "svelte/types/compiler/compile/nodes/DefaultSlotTemplate";
import type Element from "svelte/types/compiler/compile/nodes/Element";
import type Head from "svelte/types/compiler/compile/nodes/Head";
import type { INode } from "svelte/types/compiler/compile/nodes/interfaces";
import type { TemplateNode } from "svelte/types/compiler/interfaces";

type Slot = Omit<CustomElementSlot, "type"> & {
    type: "Element"| "Slot",
};

type SvelteNode = INode | Slot;
type ParentNode = DefaultSlotTemplate | Element | Head;

type ParsedSlotDoc = {
    comments: string[],
    name: string;
};

export type SlotDoc = {
    htmlDoc: Doc,
    name: string;
}

export function getSlotDocs(slots: ParsedSlotDoc[]): SlotDoc[] {
    return slots.map(function useClosestHtmlDoc(property) {
        const { comments, name } = property;
        const doc = { name, htmlDoc: null };
        for (let i = comments.length -1; i >= 0; i--) {
            const value = comments[i];
            if (value.startsWith("*")) {
                doc.htmlDoc = getDocs(comment.parse(`/*${value}*/`));
                break;
            }
        }
        return doc;
    });
}

export function getLeadingComments(
    index: number,
    siblings: SvelteNode[],
): string[] {
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

export function findSlots(ast: TemplateNode): ParsedSlotDoc[] {
    const slots = [];

    if (ast) {
        svelte.walk(ast, {
            // eslint-disable-next-line max-params
            enter(node: SvelteNode, parent: ParentNode, _, index) {
                if (node.type === "Slot") {
                    const siblings: SvelteNode[] = parent?.children || [];
                    // TODO: Revert typing back to `Attribute`. Waiting for tests.
                    const name = node
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .attributes.find((a) => a.name === "name") as any;
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

export function findDescription(ast: TemplateNode): string {
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
