# styl

Lightweight CSS-in-JS runtime

## Usage

```js
import { css, keyframes } from '@intrnl/styl';

let fade_in = keyframes({
  'from': {
    opacity: 0,
  },
  'to': {
    opacity: 1,
  },
});

let button_css = css({
  backgroundColor: 'red',

  '&:hover': {
    backgroundColor: 'blue',
  },
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${fade_in} .2s ease`,
  },
});
```

## SSR

You can get the CSS by calling `extract` function, but this requires your `css`
and `keyframes` call to be within the component itself rather than outside.
