System.register(['./generated-dynamic.js'], (function (exports, module) {
	'use strict';
	var DEP;
	return {
		setters: [function (module) {
			DEP = module.D;
		}],
		execute: (function () {

			Promise.all([module.import('./generated-dynamic.js').then(function (n) { return n.b; }), module.import('./generated-dynamic.js').then(function (n) { return n.d; }), module.import('./generated-dynamic.js').then(function (n) { return n.a; })]).then(
				results => console.log(results, DEP)
			);

		})
	};
}));
