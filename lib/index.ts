import type { Properties as CSSProperties } from 'csstype';
import { toKebab } from './utils';

import { nanoid } from 'nanoid/non-secure';

let sheet_id = '_styl';

let css_prefix = 'c';
let keyframes_prefix = 'k';

let ssr = { textContent: '' };

export type CSSDeclaration = {
	[selector: string]: CSSProperties;
} & CSSProperties;

export type KeyframesDeclaration = {
	[transition: string]: CSSProperties;
};

export function css (decl: CSSDeclaration) {
	let id = css_prefix + nanoid(8);
	let style = compile_css(id, decl);

	appendStyle(style);
	return id;
}

export function keyframes (decl: KeyframesDeclaration) {
	let id = keyframes_prefix + nanoid(8);
	let style = compile_keyframes(id, decl);

	appendStyle(style);
	return id;
}

function appendStyle (style: string) {
	let sheet = getSheet();
	sheet.textContent += style;
}

export function extract () {
	let sheet = getSheet();
	let out = sheet.textContent;

	sheet.textContent = '';
	return out;
}

function getSheet (target?: Element) {
	try {
		if (!target) {
			target = document.head;
		}

		return target.querySelector('#' + sheet_id)
			|| target.appendChild(Object.assign(document.createElement('style'), {
				id: sheet_id,
			}));
	}
	catch {
		return ssr;
	}
}

function compile_css (
	id: string,
	decl: CSSDeclaration,
	inner?: string | 0,
	outer?: string | 0,
) {
	let inner_styles = '';
	let outer_styles = '';

	for (let k in decl) {
		let v = decl[k];

		// & is inner
		// @ is outer
		if (k[0] == '&') {
			outer_styles += compile_css(id, v as CSSDeclaration, k.slice(1), 0);
		}
		else if (k[0] == '@') {
			outer_styles += compile_css(id, v as CSSDeclaration, 0, k);
		}
		else {
			inner_styles += `${toKebab(k)}:${v};`;
		}
	}

	inner_styles = `.${id}${inner || ''}{${inner_styles}}`;
	if (outer) {
		inner_styles = `${outer}{${inner_styles}}`;
	}

	return inner_styles + outer_styles;
}

function compile_keyframes (id: string, decl: CSSDeclaration) {
	let styles = '';

	for (let t in decl) {
		let props = decl[t];
		let inner_styles = '';

		for (let k in props) {
			let v = (props as any)[k];
			inner_styles += `${toKebab(k)}:${v};`;
		}

		styles += `${t}{${inner_styles}}`;
	}

	return `@keyframes ${id}{${styles}}`;
}
