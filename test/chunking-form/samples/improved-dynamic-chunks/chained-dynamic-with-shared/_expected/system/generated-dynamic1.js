System.register(['./main.js'], (function () {
	'use strict';
	var shared;
	return {
		setters: [function (module) {
			shared = module.shared;
		}],
		execute: (function () {

			Promise.resolve().then(function () { return dynamic2; });
			console.log('dynamic1');

			var dynamic2 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				shared: shared
			});

		})
	};
}));
