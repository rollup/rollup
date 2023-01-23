// maths.js

// This function isn't used anywhere, so
// Rollup excludes it from the bundle...
export const square = x => x * x;

// This function gets included
// rewrite this as `square(x) * x`
// and see what happens!
export const cube = x => x * x * x;

// This "side effect" creates a global
// variable and will not be removed.
window.effect1 = 'created';

const includeEffect = false;
if (includeEffect) {
	// On the other hand, this is never
	// executed and thus removed.
	window.effect1 = 'not created';
}
