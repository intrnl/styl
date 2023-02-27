import type { Properties as CSSProperties } from 'csstype';
import { toKebab } from './utils.js';

import { nanoid } from 'nanoid/non-secure';

let sheet_id = '_styl';

let var_prefix = 'v';
let css_prefix = 'c';
let keyframes_prefix = 'k';

let ssr = { textContent: '' };

export type StyleRule = {
	[selector: `var(${string})`]: string;
	[selector: `${string}&${string}`]: StyleRule;
	[selector: `@${string}`]: StyleRule;
} & CSSProperties;

export type KeyframesRule = {
	[transition: string]: CSSProperties;
};

export type ComplexStyleRules = StyleRule | Array<string | StyleRule>;

export function createVar () {
	return `var(--${var_prefix}${nanoid(8)})`;
}

export function style (args: ComplexStyleRules) {
	let result = '';

	if (Array.isArray(args)) {
		for (let idx = 0, len = args.length; idx < len; idx++) {
			let arg = args[idx];

			result && (result += ' ');

			if (typeof arg === 'string') {
				result += arg;
			}
			else {
				result += css(arg);
			}
		}
	}
	else {
		return css(args);
	}

	return result;
}

export function globalStyle (selector: string, rule: StyleRule) {
	let style = compile_css(selector, rule);
	appendStyle(style);
}

function css (rule: StyleRule) {
	let id = css_prefix + nanoid(8);
	let style = compile_css('.' + id, rule);

	appendStyle(style);
	return id;
}

export function keyframes (rule: KeyframesRule) {
	let id = keyframes_prefix + nanoid(8);
	let style = compile_keyframes(id, rule);

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
	decl: StyleRule,
	outer?: string | 0,
) {
	let inner_styles = '';
	let outer_styles = '';

	for (let property in decl) {
		let value: any = decl[property as any];

		if (property.includes('&')) {
			outer_styles += compile_css(property.replaceAll('&', id), value as StyleRule, 0);
		}
		else if (property[0] == '@') {
			outer_styles += compile_css(id, value as StyleRule, property);
		}
		else if (property[0] === 'v' && property[1] === 'a' && property[3] === '(') {
			let idx = property.indexOf(',');
			let variable = property.slice(4, idx);

			inner_styles += `${variable}:${value};`;
		}
		else {
			inner_styles += `${toKebab(property)}:${value};`;
		}
	}

	inner_styles = `${id}{${inner_styles}}`;
	if (outer) {
		inner_styles = `${outer}{${inner_styles}}`;
	}

	return inner_styles + outer_styles;
}

function compile_keyframes (id: string, decl: KeyframesRule) {
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
