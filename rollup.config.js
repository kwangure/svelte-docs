import commonjs from "@rollup/plugin-commonjs";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import json from "@rollup/plugin-json";
import node from "@rollup/plugin-node-resolve";
import path from "path";
import pkg from "./package.json";
import typescript from "@rollup/plugin-typescript";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const external = [].concat(
    Object.keys(pkg.dependencies || {}),
    Object.keys(pkg.peerDependencies || {}),
    Object.keys(process.binding("natives")),
    ["typescript", "svelte2tsx"],
);

const DEV = Boolean(process.env.ROLLUP_WATCH);

function remove(options = {}) {
    const { hook = "renderStart" } = options;
    return {
        name: "empty-dir",
        [hook]: async (rollupOutputOptions) => {
            const dir = options.dir || rollupOutputOptions.dir;
            if (dir) await fs.remove(dir);
        },
    };
}

export default [
    {
        input: [
            "src/lib/index.js",
        ],
        output: {
            dir: "dist",
            chunkFileNames: "chunks/[name]-[hash].js",
            sourcemap: false,
        },
        external: (id) => external.includes(id),
        plugins: [
            remove(),
            node(),
            commonjs(),
            json(),
            typescript({
                sourceMap: DEV,
            }),
        ],
        onwarn(warning, warn) {
            if (warning.code === "THIS_IS_UNDEFINED" && (/node_modules\/comment-parser/).test(warning.id)) return;
            warn(warning);
        },
    },
];
