# `styl`

Lightweight CSS-in-JS runtime

## Usage

```js
import { keyframes, style } from '@intrnl/styl';

let fadeIn = keyframes({
	'from': {
		opacity: 0,
	},
	'to': {
		opacity: 1,
	},
});

let button = style({
	backgroundColor: 'red',

	'&:hover': {
		backgroundColor: 'blue',
	},
	'@media (prefers-reduced-motion: no-preference)': {
		animation: `${fade_in} .2s ease`,
	},
});
```

### Theming

```js
import { createTheme, createThemeContract, style } from '@intrnl/styl';

let theme = createThemeContract({
	palette: {
		black: null,
		white: null,
		red: null,
	},
});

let themeClass = createTheme(theme, {
	palette: {
		black: '#000',
		white: '#fff',
		red: '#f00',
	},
});

let Button = style({
	backgroundColor: theme.palette.black,
});
```

### Recipes

```js
import { recipe } from '@intrnl/styl';

let Button = recipe({
	base: {
		borderRadius: 6,
	},

	variants: {
		color: {
			neutral: { background: 'whitesmoke' },
			brand: { background: 'blueviolet' },
			accent: { background: 'slateblue' },
		},
		size: {
			small: { padding: 12 },
			medium: { padding: 16 },
			large: { padding: 24 },
		},
		rounded: {
			true: { borderRadius: 999 },
		},
	},

	compoundVariants: [
		{
			variants: {
				color: 'neutral',
				size: 'large',
			},
			style: {
				background: 'ghostwhite',
			},
		},
	],

	defaultVariants: {
		color: 'accent',
		size: 'medium',
	},
});
```
