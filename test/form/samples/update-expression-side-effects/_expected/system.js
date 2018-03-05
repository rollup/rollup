System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			const effectY = () => {
				console.log('effect');
				return 'y';
			};

			const x = {y: 1};
			x[effectY()]++;

			let foo = {bar: {}};
			foo++;
			foo.bar.baz = 1;

		}
	};
});
