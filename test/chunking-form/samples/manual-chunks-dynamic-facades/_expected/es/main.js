import { DEP } from './generated-dynamic.js';

Promise.all([import('./generated-dynamic.js'), import('./generated-dynamic2.js'), import('./generated-dynamic3.js')]).then(
	results => console.log(results, DEP)
);
