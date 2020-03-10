System.register(['./generated-lib.js'], function () {
	'use strict';
	var emptyFunction;
	return {
		setters: [function (module) {
			emptyFunction = module.e;
		}],
		execute: function () {

			function fn() {
				var emptyFunction$1 = emptyFunction;
				console.log(emptyFunction$1);
			}

			console.log('dep1');

			fn();

		}
	};
});
