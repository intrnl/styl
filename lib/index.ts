import type { Properties as CSSProperties } from 'csstype';
import { toKebab } from './utils.js';

import { nanoid } from 'nanoid/non-secure';

// https://github.com/preactjs/preact/issues/2607
let nondimensional_re =
	/^(-|f[lo].*[^se]$|g.{5,}[^ps]$|z|o[pr]|(W.{5})?[lL]i.*(t|mp)$|an|(bo|s).{4}Im|sca|m.{6}[ds]|ta|c.*[st]$|wido|ini)/;

let sheet_id = '_styl';

let var_prefix = 'v';
let css_prefix = 'c';
let keyframes_prefix = 'k';
let container_prefix = 'o';

export type StyleRule = {
	[selector: `var(${string})`]: string;
	[selector: `${string}&${string}`]: StyleRule;
	[selector: `@${string}`]: StyleRule;
} & CSSProperties;

export type KeyframesRule = {
	[transition: string]: CSSProperties;
};

export type ComplexStyleRules = StyleRule | Array<string | StyleRule>;

function createId (prefix: string) {
	return prefix + nanoid(8);
}

export function createContainer () {
	return /*@__INLINE__*/ createId(container_prefix);
}

export function createVar () {
	return ('var(--' + /*@__INLINE__*/ createId(var_prefix) + ')') as `var()`;
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
	let id = /*@__INLINE__*/ createId(css_prefix);

	globalStyle('.' + id, rule);
	return id;
}

export function keyframes (rule: KeyframesRule) {
	let id = /*@__INLINE__*/ createId(keyframes_prefix);
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

function getSheet () {
	return (window as any)[sheet_id]
		|| Object.assign(document.head.appendChild(document.createElement('style')), { id: sheet_id });
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

			inner_styles += variable + ':' + value + ';';
		}
		else {
			if (typeof value === 'number' && !nondimensional_re.test(property)) {
				// @ts-expect-error
				value += 'px';
			}

			inner_styles += toKebab(property) + ':' + value + ';';
		}
	}

	if (inner_styles) {
		inner_styles = id + '{' + inner_styles + '}';
	}

	inner_styles += outer_styles;

	if (inner_styles && outer) {
		inner_styles = outer + '{' + inner_styles + '}';
	}

	return inner_styles;
}

function compile_keyframes (id: string, decl: KeyframesRule) {
	let styles = '';

	for (let transition in decl) {
		let props = decl[transition];
		let inner_styles = '';

		for (let property in props) {
			let value = (props as any)[property];

			if (typeof value === 'number' && !nondimensional_re.test(property)) {
				// @ts-expect-error
				value += 'px';
			}

			inner_styles += toKebab(property) + ':' + value + ';';
		}

		styles += transition + '{' + inner_styles + '}';
	}

	return '@keyframes ' + id + '{' + styles + '}';
}
