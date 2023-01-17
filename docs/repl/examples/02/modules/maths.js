// maths.js

// This function isn't used anywhere, so
// Rollup excludes it from the bundle...
export const square = x => x * x;

// This function gets included
// rewrite this as `square(x) * x`
// and see what happens!
export const cube = x => x * x * x;
