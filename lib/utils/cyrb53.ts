// cyrb53 hash function
// https://stackoverflow.com/a/52171480

let imul = /*#__PURE__*/Math.imul;

export function cyrb53 (str: string, seed = 0) {
	let h1 = 0xdeadbeef ^ seed;
	let h2 = 0x41c6ce57 ^ seed;

	for (let i = 0; i < str.length; i++) {
		let ch = str.charCodeAt(i);

		h1 = imul(h1 ^ ch, 2654435761);
		h2 = imul(h2 ^ ch, 1597334677);
	}

	h1 = imul(h1 ^ (h1 >>> 16), 2246822507) ^ imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = imul(h2 ^ (h2 >>> 16), 2246822507) ^ imul(h1 ^ (h1 >>> 13), 3266489909);

	return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
