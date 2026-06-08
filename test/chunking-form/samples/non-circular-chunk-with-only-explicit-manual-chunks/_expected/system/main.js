System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			module.import('./generated-a.js').then(({a}) => console.log(a));
			module.import('./generated-b.js').then(({b}) => console.log(b));

		})
	};
}));
