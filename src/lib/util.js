import { encode } from './base62.js';
import { xxhash } from './xxhash.js';


let RE_UPPERCASE = /[A-Z]/g;

export function hash (value) {
	return encode(xxhash(JSON.stringify(value)));
}

export function toKebab (str) {
	return (str.startsWith('ms') ? '-' : '')
		+ str.replace(RE_UPPERCASE, '-$&').toLowerCase();
}
