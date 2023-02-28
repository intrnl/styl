import { type ComplexStyleRule, style, styleVariants } from './style.js';

type RecipeStyleRule = ComplexStyleRule | string;

type VariantDefinitions = Record<string, RecipeStyleRule>;

type BooleanMap<T> = T extends 'true' | 'false' ? boolean : T;

type VariantGroups = Record<string, VariantDefinitions>;
type VariantSelection<Variants extends VariantGroups> = {
	[VariantGroup in keyof Variants]?: BooleanMap<keyof Variants[VariantGroup]>;
};

interface CompoundVariant<Variants extends VariantGroups> {
	variants: VariantSelection<Variants>;
	style: RecipeStyleRule;
}

type PatternOptions<Variants extends VariantGroups> = {
	base?: RecipeStyleRule;
	variants?: Variants;
	defaultVariants?: VariantSelection<Variants>;
	compoundVariants?: Array<CompoundVariant<Variants>>;
};

type RuntimeFn<Variants extends VariantGroups> = (
	options?: VariantSelection<Variants>,
) => string;

type VariantMap<Variants extends VariantGroups> = {
	[P in keyof Variants]: { [P in keyof Variants[keyof Variants]]: string };
};

export type RecipeVariants<RecipeFn extends RuntimeFn<VariantGroups>> = Parameters<RecipeFn>[0];

export function recipe<Variants extends VariantGroups> (
	options: PatternOptions<Variants>,
): RuntimeFn<Variants> {
	let { base = '', variants, compoundVariants = [], defaultVariants } = options;

	let base_class = typeof base === 'string' ? base : style(base);

	let variant_classes: VariantMap<Variants> | undefined;
	let compound_classes: [VariantSelection<Variants>, string][] | undefined;

	let compound_length = compoundVariants.length;

	for (let key in variants) {
		// @ts-expect-error
		variant_classes ||= {};

		// @ts-expect-error
		variant_classes![key] = styleVariants(variants[key], (rule) => typeof rule === 'string' ? [rule] : rule);
	}

	for (let idx = 0; idx < compound_length; idx++) {
		let def = compoundVariants[idx];

		let matcher = def.variants;
		let rule = def.style;

		compound_classes ||= [];
		compound_classes.push([matcher, typeof rule === 'string' ? rule : style(rule)]);
	}

	return (props) => {
		if (!variant_classes) {
			return base_class;
		}

		let result = base_class;
		let combined_props: VariantSelection<Variants>;

		if (defaultVariants) {
			if (props) {
				combined_props = { ...defaultVariants };

				for (let key in props) {
					let value = props[key];

					if (value === undefined) {
						continue;
					}

					combined_props[key] = value;
				}
			}
			else {
				combined_props = defaultVariants;
			}
		}
		else {
			combined_props = props || {};
		}

		for (let variant in variant_classes) {
			let selection = combined_props[variant];

			if (selection == null) {
				continue;
			}

			if (typeof selection === 'boolean') {
				// @ts-expect-error
				selection = selection ? 'true' : 'false';
			}

			// @ts-expect-error
			let classname = variant_classes[variant][selection];

			if (classname) {
				result && (result += ' ')
				result += classname;
			}
		}

		loop:
		for (let idx = 0; idx < compound_length; idx++) {
			let def = compound_classes![idx];

			let matcher = def[0];
			let classname = def[1];

			for (let key in matcher) {
				let match = matcher[key];
				let value = combined_props[key];

				if (match !== value) {
					continue loop;
				}
			}

			result && (result += ' ')
			result += classname;
		}

		return result;
	};
}
