import * as comment from "comment-parser/es6";
import * as svelte from "svelte/compiler";
import type {
    BaseNode,
    Comment,
    ExportAllDeclaration,
    ExportDefaultDeclaration,
    ExportNamedDeclaration,
    ExportSpecifier,
    // eslint-disable-next-line import/no-unresolved
} from "estree";
import { Doc, getDocs } from "./comment";
import { error } from "./util";
import type { Script } from "svelte/types/compiler/interfaces";

type Export = ExportAllDeclaration
| ExportDefaultDeclaration
| ExportNamedDeclaration
| ExportSpecifier

type ParsedExportDoc = {
    name: string;
    kind: string;
    comments: Comment[];
    optional: boolean;
}

export type ExportDoc = {
    name: string;
    kind: string;
    comments: Comment[];
    optional: boolean;
    jsDoc: Doc;
}

export function getJsDoc(variables: ParsedExportDoc[]): ExportDoc[] {
    return variables.map(function useClosestJsDoc(variable) {
        const { comments = [], ...rest } = variable;
        for (let i = comments.length -1; i >= 0; i--) {
            const { type, value } = comments[i];
            if (type === "Block" && value.startsWith("*")) {
                Object.assign(rest, {
                    jsDoc: getDocs(comment.parse(`/*${value}*/`)),
                });
                break;
            }
        }
        return rest as ExportDoc;
    });
}

function extractExport(node: Export): ParsedExportDoc {
    const variable = {};
    if (node.type === "ExportNamedDeclaration") {
        if (node.declaration) {
            if (node.declaration.type === "VariableDeclaration") {
                // e.g export let prop1, pro2;
                if (node.declaration.declarations.length > 1) {
                    // TODO: Svelte allows multiple declarations now. Remove.
                    error({
                        code: "multiple-declarations-in-export",
                        message: "Use one variable per `export` prop.",
                    });
                }
                const [declaration] = node.declaration.declarations;
                // TODO: Handle different kinds of declarations;
                Object.assign(variable, {
                    kind: node.declaration.kind,
                    // @ts-expect-error assume `Identifier` for now
                    name: declaration.id.name,
                    comments: node.leadingComments,
                });

                // TODO: Handle multiple kinds of values
                // e.g export let prop = "value";
                if (declaration.init) {
                    Object.assign(variable, {
                        optional: true,
                        // @ts-expect-error handle simple assignments only for now
                        value: declaration.init.value,
                    });
                // e.g export let prop;
                } else {
                    Object.assign(variable, {
                        optional: false,
                    });
                }

            // e.g export function propFunc(value) { return value; }
            } else if (node.declaration.type === "FunctionDeclaration") {
                Object.assign(variable, {
                    kind: "function",
                    name: node.declaration.id.name,
                    comments: node.leadingComments,
                });
            } else {
                console.log("Handle \"node.declaration\" that is not \
\"VariableDeclaration\"");
            }
        /* e.g
            let propName;
            export { propName as prop };
        */
        } else {
            /* e.g
                let propName1;
                let propName2;
                export { propName1 as prop1, propName2 as prop2 };
             */
            if (node.specifiers.length > 1) {
                error({
                    code: "multiple-declarations-in-export",
                    message: "Use one variable per `export` prop.",
                });
            }
            const [specifier] = node.specifiers;
            Object.assign(variable, {
                kind: "alias",
                name: specifier.exported.name,
                alias: specifier.local.name,
                comments: node.leadingComments,
            });
        }
    } else {
        console.log("Handle documenting Nodes that are not \
\"ExportNamedDeclaration\"");
    }
    return variable as ParsedExportDoc;
}

export function isExport(node: BaseNode): node is Export {
    return (/^Export/).test(node.type);
}

export function findExportedVars(ast: Script): ParsedExportDoc[] {
    const variables: ParsedExportDoc[] = [];

    if (ast) {
        svelte.walk(ast, {
            enter(node) {
                if (isExport(node)) {
                    const variable = extractExport(node);
                    variables.push(variable);
                    return this.skip();
                }
            },
        });
    }

    return variables;
}

