System.register(['https://unpkg.com/foo'], (function (exports, module) {
	'use strict';
	var foo;
	return {
		setters: [function (module) {
			foo = module.default;
		}],
		execute: (function () {

			assert.equal(foo, 42);

			module.import('https://unpkg.com/foo').then(({ default: foo }) => assert.equal(foo, 42));

		})
	};
}));
