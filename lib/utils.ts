let RE_UPPERCASE = /[A-Z]/g;

export function toKebab (str: string) {
	return (str.startsWith('ms') ? '-' : '')
		+ str.replace(RE_UPPERCASE, '-$&').toLowerCase();
}
