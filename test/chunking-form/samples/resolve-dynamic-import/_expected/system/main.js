System.register(['./direct-relative-external', 'to-indirect-relative-external', 'direct-absolute-external', 'to-indirect-absolute-external'], (function (exports, module) {
	'use strict';
	return {
		setters: [null, null, null, null],
		execute: (function () {

			// nested
			Promise.resolve().then(function () { return existing; });
			module.import('./direct-relative-external');
			module.import('to-indirect-relative-external');
			module.import('direct-absolute-external');
			module.import('to-indirect-absolute-external');

			console.log('existing');

			var existing = /*#__PURE__*/Object.freeze({
				__proto__: null
			});

			//main
			Promise.resolve().then(function () { return existing; });
			module.import('./direct-relative-external');
			module.import('to-indirect-relative-external');
			module.import('direct-absolute-external');
			module.import('to-indirect-absolute-external');

			module.import('dynamic-direct-external' + unknown);
			module.import('to-dynamic-indirect-external');
			Promise.resolve().then(function () { return existing; });
			module.import('my' + 'replacement');

		})
	};
}));
