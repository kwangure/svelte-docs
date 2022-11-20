/**
 * @param {{ code: string; message: string }} details
 */
export function error(details) {
	const { code, message } = details;
	const error = /** @type {Error & { code: string }}*/ (new Error(message));
	error.code = code;
	throw error;
}

export function getName(filename) {
	if (filename) {
		return filename.substring(
			filename.lastIndexOf('/') + 1,
			filename.lastIndexOf('.'),
		);
	}

	return '';
}

export function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function findReverse(array, predicate) {
	for (let i = array.length -1; i >= 0; i--) {
		if (predicate(array[i])) return array[i];
	}
}

