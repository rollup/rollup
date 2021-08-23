System.register([], ((exports, module) => {
	'use strict';
	return {
		execute: (() => {

			module.import('./generated-dep1.js').then(n => n.d).then(console.log);

		})
	};
}));
