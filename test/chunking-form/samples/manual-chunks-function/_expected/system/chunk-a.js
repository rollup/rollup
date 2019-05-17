System.register(['./generated-chunk-b.js', './generated-chunk-c.js'], function (exports, module) {
	'use strict';
	return {
		setters: [function () {}, function () {}],
		execute: function () {

			console.log('dep1');

			console.log('dep-a');

			console.log('main-a');

		}
	};
});
