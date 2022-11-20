import { capitalize, getName } from '../helpers/util.js';
import { findCustomProperties, findDescription, parseCssDoc } from '../helpers/css.js';
import { parse } from 'css-tree';

/**
 * @param {string} code
 * @param {{ filepath: string; }} options
 */
export function css(code, options) {
	const { filepath } = options;

	// Use different css-tree parser since Svelte's ignores comments
	const ast = parse(code, { positions: true });
	const customProperties = findCustomProperties(ast);

	return {
		name: capitalize(getName(filepath)),
		description: findDescription(ast),
		workingDirectoryFilepath: filepath.replace(new RegExp(`^${process.cwd()}/`), ''),
		customProperties: parseCssDoc(customProperties),
	};
}
