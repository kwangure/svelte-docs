import * as comment from "comment-parser";
import * as svelte from "svelte/compiler";
import { error } from "./util.js";
import { getDocs } from "./comment.js";

export function parseJsDoc(variables) {
    return variables.map(function useClosestJsDoc(variable) {
        const { comments = [], ...rest } = variable;
        for (let i = comments.length -1; i >= 0; i--) {
            const { type, value } = comments[i];
            if (type === "Block" && value.startsWith("*")) {
                rest.jsDoc = getDocs(comment.parse(`/*${value}*/`));
                break;
            }
        }
        return rest;
    });
}

function extractExport(node) {
    const variable = {};
    if (node.type === "ExportNamedDeclaration") {
        if (node.declaration) {
            if (node.declaration.type === "VariableDeclaration") {
                // e.g export let prop1, pro2;
                if (node.declaration.declarations.length > 1) {
                    error({
                        code: "multiple-declarations-in-export",
                        message: "Use one variable per `export` prop.",
                    });
                }
                const [declaration] = node.declaration.declarations;
                Object.assign(variable, {
                    kind: node.declaration.kind,
                    name: declaration.id.name,
                    comments: node.leadingComments,
                });

                // e.g export let prop = "value";
                if (declaration.init) {
                    Object.assign(variable, {
                        optional: true,
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
    return variable;
}

export function findExportedVars(ast) {
    const variables = [];

    if (ast) {
        svelte.walk(ast, {
            enter(node) {
                if ((/^Export/).test(node.type)) {
                    const variable = extractExport(node);
                    variables.push(variable);
                    return this.skip();
                }
            },
        });
    }

    return variables;
}

