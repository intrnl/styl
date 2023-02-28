let RE_UPPERCASE = /[A-Z]/g;

export function to_kebab (str: string) {
	return (str.startsWith('ms') ? '-' : '')
		+ str.replace(RE_UPPERCASE, '-$&').toLowerCase();
}

export function walk_object (object: any, fn: (value: any, path: string[]) => void, path: string[] = []) {
	for (let key in object) {
		let value = object[key];
		path.push(key);

		if (typeof value === 'object' && value && !Array.isArray(value)) {
			walk_object(value, fn, path);
		}
		else {
			fn(value, path);
		}

		path.pop();
	}
}

export function clone_object (object: any, fn: (value: any, path: string[]) => any, path: string[] = []) {
	let clone: any = {};

	for (let key in object) {
		let value = object[key];
		path.push(key);

		if (typeof value === 'object' && value && !Array.isArray(value)) {
			clone[key] = clone_object(value, fn, path);
		}
		else {
			clone[key] = fn(value, path);
		}

		path.pop();
	}

	return clone;
}

export function get (source: any, path: string[]) {
	for (let idx = 0, len = path.length; idx < len; idx++) {
		let segment = path[idx];

		source = source[segment];

		if (idx !== len - 1 && (typeof source !== 'object' || !source)) {
			return;
		}
	}

	return source;
}
