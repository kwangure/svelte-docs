import * as comment from "comment-parser/es6";
import { COMMENT, DECLARATION, Element, serialize } from "stylis";
import { Doc, getDocs } from "./comment";
import { findReverse } from "./util";

type ParsedCustomPropertyDoc = {
    name: string;
    comments: string[];
    value: string;
}

export type CustomPropertyDoc = {
    name: string;
    value: string;
    cssDoc: Doc;
}

export function parseCssDoc(
    customProperties: ParsedCustomPropertyDoc[],
): CustomPropertyDoc[] {
    return customProperties.map(function useClosestJsDoc(property) {
        const { comments, ...rest } = property;
        const value = findReverse(comments, (c) => c.startsWith("/**"));
        return Object.assign(rest, {
            cssDoc: getDocs(comment.parse(value)),
        });
    });
}

export function getLeadingComments(
    index: number,
    siblings: Element[],
): string[] {
    const leadingComments: string[] = [];

    for (let i = index - 1; i >= 0; i--) {
        const previousSibling = siblings[i];
        if (previousSibling && previousSibling.type === COMMENT) {
            leadingComments.push(previousSibling.value);
        } else {
            break;
        }
    }

    // Reverse to maintain CSS cascading order
    return leadingComments.reverse();
}

interface CustomProperty {
    children: string;
    root: Element;
    type: string;
    length: number;
    props: string;
    value: string;
    return: string;
}

function isCustomProperty(element: Element): element is CustomProperty {
    return element.type === DECLARATION && element.value.startsWith("--");
}

export function findCustomProperties(
    ast: Element[],
): ParsedCustomPropertyDoc[] {
    const customProperties: ParsedCustomPropertyDoc[] = [];

    function getCustomProperty(
        element: Element,
        index: number,
        siblings: Element[],
    ) {
        if (isCustomProperty(element)) {
            customProperties.push({
                name: element.props,
                value: element.children,
                comments: getLeadingComments(index, siblings),
            });
            return;
        }

        if (Array.isArray(element.children)) {
            element.children.forEach((child, i, siblings) => {
                getCustomProperty(child, i, siblings);
            });
        }
    }

    serialize(ast, getCustomProperty);

    return customProperties;
}
