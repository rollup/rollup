System.register(['./generated-chunk.js', './generated-chunk2.js'], function (exports, module) {
	'use strict';
	return {
		setters: [function () {}, function () {}],
		execute: function () {

			const inlined = exports('inlined', module.import('./generated-chunk.js'));
			const separate = exports('separate', module.import('./generated-chunk2.js'));

		}
	};
});
