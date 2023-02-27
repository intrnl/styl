import { extract, globalStyle, style } from './dist/index.js';

const blue = style({
	color: 'blue',
});

const red = style({
	color: 'red',
});

const button = style([
	blue,
	{
		backgroundColor: 'red',

		'&:hover, &:active': {
			'var(--123)': '123',
			backgroundColor: 'red',
		}
	},
]);

console.log(button);
console.log(extract());
