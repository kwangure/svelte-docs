// Adapted from https://github.com/csstree/csstree/blob/master/lib/tokenizer/OffsetToLocation.js

// \n
const N = 10;
// \f
const F = 12;
// \r
const R = 13;

export function locationFromOffset(source, offset) {
	const startOffset = source.length > 0 ? isBOM(source.charCodeAt(0)) : 0;
	let line = 0;
	let column = 0;

	for (let i = startOffset; i < offset; i++) {
		const char = source.charCodeAt(i);
		column++;

		if (char === N || char === R || char === F) {
			if (char === R && (i+1) < offset && source.charCodeAt(i+1) === N) {
				i++;
			}

			line++;
			column = 1;
		}
	}

	return {
		offset,
		line,
		column,
	};
}

// detect BOM (https://en.wikipedia.org/wiki/Byte_order_mark)
export function isBOM(code) {
	// UTF-16BE
	if (code === 0xFEFF) {
		return 1;
	}

	// UTF-16LE
	if (code === 0xFFFE) {
		return 1;
	}

	return 0;
}

