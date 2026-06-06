import { D as DEP } from './generated-dynamic.js';

Promise.all([import('./generated-dynamic.js').then(function (n) { return n.b; }), import('./generated-dynamic.js').then(function (n) { return n.d; }), import('./generated-dynamic.js').then(function (n) { return n.a; })]).then(
	results => console.log(results, DEP)
);
