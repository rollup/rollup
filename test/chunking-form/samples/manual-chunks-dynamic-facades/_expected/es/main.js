import { DEP } from './generated-dynamic1.js';

Promise.all([import('./generated-dynamic1.js'), import('./generated-dynamic2.js'), import('./generated-dynamic3.js')]).then(
	results => console.log(results, DEP)
);
