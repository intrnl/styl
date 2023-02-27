import { encode } from './base62';
import { cyrb53 } from './cyrb53';

let RE_UPPERCASE = /[A-Z]/g;

export function hash (value: any) {
	return encode(cyrb53(JSON.stringify(value)));
}

export function toKebab (str: string) {
	return (str.startsWith('ms') ? '-' : '')
		+ str.replace(RE_UPPERCASE, '-$&').toLowerCase();
}
