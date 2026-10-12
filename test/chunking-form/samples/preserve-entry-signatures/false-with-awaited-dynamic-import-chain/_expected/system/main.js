System.register(['./generated-shared.js'], (function (exports, module) {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.v;
		}],
		execute: (async function () {

			console.log(() => module.import('./generated-p.js'));
			console.log(value);
			await module.import('./generated-d.js');

		})
	};
}));
