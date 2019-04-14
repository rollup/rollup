import { DEP } from './generated-dynamic.js';

Promise.all([import('./generated-dynamic.js'), import('./generated-chunk.js'), import('./generated-chunk2.js')]).then(
	results => console.log(results, DEP)
);
