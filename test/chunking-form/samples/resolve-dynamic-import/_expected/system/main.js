System.register(['./direct-relative-external', 'to-indirect-relative-external', 'direct-absolute-external', 'to-indirect-absolute-external'], function (exports, module) {
	'use strict';
	return {
		setters: [function () {}, function () {}, function () {}, function () {}],
		execute: function () {

			// nested
			Promise.resolve().then(function () { return existing; });
			module.import('./direct-relative-external');
			module.import('to-indirect-relative-external');
			module.import('direct-absolute-external');
			module.import('to-indirect-absolute-external');

			const value = 'existing';
			console.log('existing');

			var existing = /*#__PURE__*/Object.freeze({
				__proto__: null,
				value: value
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

		}
	};
});
