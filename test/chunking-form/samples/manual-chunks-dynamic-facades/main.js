import { DEP } from './dep';

Promise.all([import('./dynamic1.js'), import('./dynamic2.js'), import('./dynamic3.js')]).then(
	results => console.log(results, DEP)
);
