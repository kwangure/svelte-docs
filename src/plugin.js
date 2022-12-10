import { css } from './parse/css.js';
import { dataToEsm } from '@rollup/pluginutils';
import fs from 'fs';
import { svelte } from './parse/svelte.js';

const DOCS_QUERY_RE = /.*(?=:docs)\b/;
const docsImport = (/** @type {string} */ id) => DOCS_QUERY_RE.exec(id);

/**
 * @returns {import('vite').Plugin}
 */
export function plugin() {
	return {
		name: 'vite-plugin-docs',
		enforce: 'pre',
		async resolveId(id, importer, options) {
			const match = docsImport(id);
			if (match) {
				// without ':docs' postfix
				const [filepath] = match;
				const resolved = await this
					.resolve(filepath, importer, options);

				if (resolved) return `${resolved.id}:docs`;
			}
		},
		load(id) {
			const match = docsImport(id);
			if (match) {
				const [filepath] = match;
				return fs.readFileSync(filepath, 'utf-8');
			}
		},
		transform(code, id) {
			const match = docsImport(id);
			if (!match) return;
			const [filepath] = match;

			let result = {};
			if (filepath.endsWith('.svelte')) {
				result = svelte(code, { filepath });
			} else if (filepath.endsWith('.css')) {
				result = css(code, { filepath });
			}

			return { code: dataToEsm(result) };
		},
	};
}
