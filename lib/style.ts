import { type Properties } from 'csstype';

import { getUid } from './scope.js';
import { clone_object, get, to_kebab, walk_object } from './utils.js';

// https://github.com/preactjs/preact/issues/2607
let nondimensional_re =
	/^(-|f[lo].*[^se]$|g.{5,}[^ps]$|z|o[pr]|(W.{5})?[lL]i.*(t|mp)$|an|(bo|s).{4}Im|sca|m.{6}[ds]|ta|c.*[st]$|wido|ini)/;

let sheet_id = '_styl';

export type CSSVarFunction = `var()`;

interface ContainerProperties {
	container?: string;
	containerType?: 'size' | 'inline-size' | (string & {});
	containerName?: string;
}

type CSSTypeProperties =
	& Properties<number | (string & {})>
	& ContainerProperties;

export type CSSProperties = {
	[Property in keyof CSSTypeProperties]:
		| CSSTypeProperties[Property]
		| CSSVarFunction
		| Array<CSSVarFunction | CSSTypeProperties[Property]>;
};

export interface CSSKeyframes {
	[time: string]: CSSProperties;
}

export type CSSPropertiesWithVars = CSSProperties & {
	vars?: {
		[key: string]: string;
	};
};

export interface MediaQueries<StyleType> {
	'@media'?: {
		[query: string]: StyleType;
	};
}

export interface FeatureQueries<StyleType> {
	'@supports'?: {
		[query: string]: StyleType;
	};
}

export interface ContainerQueries<StyleType> {
	'@container'?: {
		[query: string]: StyleType;
	};
}

export type WithQueries<StyleType> =
	& MediaQueries<
		& StyleType
		& FeatureQueries<StyleType & ContainerQueries<StyleType>>
		& ContainerQueries<StyleType & FeatureQueries<StyleType>>
	>
	& FeatureQueries<
		& StyleType
		& MediaQueries<StyleType & ContainerQueries<StyleType>>
		& ContainerQueries<StyleType & MediaQueries<StyleType>>
	>
	& ContainerQueries<
		& StyleType
		& MediaQueries<StyleType & FeatureQueries<StyleType>>
		& FeatureQueries<StyleType & MediaQueries<StyleType>>
	>;

interface SelectorMap {
	[selector: string]:
		& CSSPropertiesWithVars
		& WithQueries<CSSPropertiesWithVars>;
}

export interface StyleWithSelectors extends CSSPropertiesWithVars {
	selectors?: SelectorMap;
}

export type StyleRule = StyleWithSelectors & WithQueries<StyleWithSelectors>;

export type KeyframesRule = {
	[transition: string]: CSSPropertiesWithVars;
};

export type ComplexStyleRule = StyleRule | Array<string | StyleRule>;

export function createContainer (debugName?: string) {
	return getUid(debugName);
}

export function createVar (debugName?: string) {
	return ('var(--' + getUid(debugName) + ')') as CSSVarFunction;
}

export function fallbackVar (variable: CSSVarFunction, fallback: string) {
	return (variable.slice(0, -1) + ', ' + fallback + ')') as CSSVarFunction;
}

export function style (args: ComplexStyleRule, debugName?: string) {
	let result = '';

	if (Array.isArray(args)) {
		for (let idx = 0, len = args.length; idx < len; idx++) {
			let arg = args[idx];

			result && (result += ' ');

			if (typeof arg === 'string') {
				result += arg;
			}
			else {
				result += css(arg, debugName);
			}
		}
	}
	else {
		return css(args, debugName);
	}

	return result;
}

export function styleVariants<Map extends Record<string | number, ComplexStyleRule>> (
	map: Map,
): Record<keyof Map, string>;
export function styleVariants<Data extends Record<string | number, unknown>, Key extends keyof Data> (
	data: Data,
	mapper: (value: Data[Key], key: Key) => ComplexStyleRule,
): Record<keyof Data, string>;
export function styleVariants (data: any, mapper?: any) {
	let result: any = {};

	for (let key in data) {
		result[key] = style(mapper ? mapper(data[key], key) : data[key]);
	}

	return result;
}

export function globalStyle (selector: string, rule: StyleRule) {
	let style = compile_css(selector, rule);
	append_style(style);
}

function css (rule: StyleRule, debugName?: string) {
	let id = getUid(debugName);

	globalStyle('.' + id, rule);
	return id;
}

export function keyframes (rule: KeyframesRule, debugName?: string) {
	let id = getUid(debugName);
	let style = compile_keyframes(id, rule);

	append_style(style);
	return id;
}

export interface NullableTokens {
	[key: string]: string | NullableTokens | null;
}

export interface Tokens {
	[key: string]: string | Tokens;
}

type Primitive = string | boolean | number | null | undefined;

type MapLeafNodes<Obj, LeafType> = {
	[Prop in keyof Obj]: Obj[Prop] extends Primitive ? LeafType
		: Obj[Prop] extends Record<string | number, any> ? MapLeafNodes<Obj[Prop], LeafType>
		: never;
};

export type ThemeVars<Contract extends NullableTokens = NullableTokens> = MapLeafNodes<
	Contract,
	CSSVarFunction
>;

export function createThemeContract<Tokens extends NullableTokens> (tokens: Tokens): ThemeVars<Tokens> {
	return clone_object(tokens, () => createVar());
}

export function assignVars<Contract extends ThemeVars> (
	contract: Contract,
	tokens: MapLeafNodes<Contract, string>,
): Record<CSSVarFunction, string> {
	let setters: any = {};

	walk_object(tokens, (value, path) => {
		setters[get(contract, path)] = value;
	});

	return setters;
}

export function createGlobalTheme<ThemeTokens extends Tokens> (
	selector: string,
	tokens: ThemeTokens,
): ThemeVars<ThemeTokens>;
export function createGlobalTheme<ThemeContract extends ThemeVars> (
	selector: string,
	contract: ThemeContract,
	tokens: MapLeafNodes<ThemeContract, string>,
): void;
export function createGlobalTheme (selector: string, arg2: any, arg3?: any) {
	let create_vars = !arg3;

	let theme_vars = create_vars ? createThemeContract(arg2) : (arg2 as ThemeVars<any>);
	let tokens = create_vars ? arg2 : arg3;

	globalStyle(selector, { vars: assignVars(theme_vars, tokens) });

	if (create_vars) {
		return theme_vars;
	}
}

export function createTheme<ThemeTokens extends Tokens> (
	tokens: ThemeTokens,
	debugName?: string,
): [name: string, vars: ThemeVars<ThemeTokens>];
export function createTheme<ThemeContract extends ThemeVars> (
	contract: ThemeContract,
	tokens: MapLeafNodes<ThemeContract, string>,
	debugName?: string,
): string;
export function createTheme (arg1: any, arg2?: any, arg3?: string): any {
	let has_contract = typeof arg2 === 'object';

	let name = getUid(has_contract ? arg3 : arg2);

	let vars = has_contract
		? createGlobalTheme(name, arg1, arg2)
		: createGlobalTheme(name, arg1);

	return vars ? [name, vars] : name;
}

let queued = '';

function flush_style () {
	let sheet = get_sheet();
	sheet.textContent += queued;
	queued = '';
}

function append_style (style: string) {
	if (!queued && style) {
		requestAnimationFrame(flush_style);
	}

	queued += style;
}

function get_sheet () {
	return (globalThis as any)[sheet_id]
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
		// @ts-expect-error
		let value: any = decl[property];

		if (property[0] == '@') {
			for (let s in value) {
				outer_styles += compile_css(id, value as StyleRule, property + ' ' + s);
			}
		}
		else if (property === 'selectors') {
			for (let selector in value) {
				let decl = value[selector];

				outer_styles += compile_css(selector.replaceAll('&', id), decl, 0);
			}
		}
		else if (property === 'vars') {
			for (let k in value) {
				let variable = k[0] === 'v' && k[3] === '(' ? k.slice(4, k.indexOf(',')) : k;
				let content = value[k];

				inner_styles += variable + ':' + content + ';';
			}
		}
		else {
			if (typeof value === 'number' && !nondimensional_re.test(property)) {
				// @ts-expect-error
				value += 'px';
			}

			inner_styles += to_kebab(property) + ':' + value + ';';
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

			if (property === 'vars') {
				for (let k in value) {
					let variable = k[0] === 'v' && k[3] === '(' ? k.slice(4, k.indexOf(',')) : k;
					let content = value[k];

					inner_styles += variable + ':' + content + ';';
				}
			}
			else {
				if (typeof value === 'number' && !nondimensional_re.test(property)) {
					// @ts-expect-error
					value += 'px';
				}

				inner_styles += to_kebab(property) + ':' + value + ';';
			}
		}

		if (inner_styles) {
			styles += transition + '{' + inner_styles + '}';
		}
	}

	return '@keyframes ' + id + '{' + styles + '}';
}
