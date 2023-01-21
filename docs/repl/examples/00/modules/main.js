// DYNAMIC IMPORTS
// Rollup supports automatic chunking and lazy-loading
// via dynamic imports utilizing the import mechanism
// of the host system.
import square from './square.js';

// Directly use some math
console.log(square(2));

// Dynamically import the rest
import('./maths.js').then(maths => {
	console.log(maths.square(5));
	console.log(maths.cube(5));
});
