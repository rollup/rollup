System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const importA = () => module.import('./generated-a.js');
			const importB = () => module.import('./generated-b.js');

			console.log(importA, importB);

		})
	};
}));
