import { encode } from './base62';
import { xxhash } from './xxhash';


let RE_UPPERCASE = /[A-Z]/g;

export function hash (value: any) {
	return encode(xxhash(JSON.stringify(value)));
}

export function toKebab (str: string) {
	return (str.startsWith('ms') ? '-' : '')
		+ str.replace(RE_UPPERCASE, '-$&').toLowerCase();
}
