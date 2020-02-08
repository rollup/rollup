System.register(['./generated-dep2-effect.js', './generated-dep4-effect.js'], function () {
	'use strict';
	return {
		setters: [function () {}, function () {}],
		execute: function () {

			var value = 42;

			function onlyUsedByOne(value) {
				console.log('Hello', value);
			}

			onlyUsedByOne(value);

		}
	};
});
