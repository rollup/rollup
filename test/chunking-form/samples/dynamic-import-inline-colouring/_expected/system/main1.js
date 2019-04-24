System.register(['./generated-inlined.js', './generated-separate.js'], function (exports, module) {
	'use strict';
	return {
		setters: [function () {}, function () {}],
		execute: function () {

			const inlined = exports('inlined', module.import('./generated-inlined.js'));
			const separate = exports('separate', module.import('./generated-separate.js'));

		}
	};
});
