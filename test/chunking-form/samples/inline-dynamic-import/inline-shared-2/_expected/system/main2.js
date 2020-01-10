System.register(['./generated-inlined.js'], function (exports, module) {
	'use strict';
	return {
		setters: [function () {}],
		execute: function () {

			module.import('./generated-inlined.js').then(console.log);

			console.log('main2');

		}
	};
});
