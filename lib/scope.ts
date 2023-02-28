interface Scope {
	h: string;
	n?: string;
	i: number;
}

let has_scopes = false;
let is_debug = false;

let guid = 0;
let scopes: Scope[] = [];

export function getUid (name?: string) {
	let length = scopes.length;

	if (has_scopes && length > 0) {
		let scope = scopes[scopes.length - 1];

		let str = scope.h + (scope.i++).toString(36);

		if (is_debug) {
			return scope.n + '__' + name + '_' + str;
		}

		return str;
	}

	return `s` + (guid++).toString(36);
}

export function enterDebug () {
	is_debug = true;
}

export function enterFileScope (hash: string, name?: string) {
	has_scopes = true;
	scopes.push({ h: hash, n: name, i: 0 });
}

export function leaveFileScope () {
	if (has_scopes) {
		scopes.pop();
	}
}
