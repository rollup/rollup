System.register(['./generated-chain-2.js', './generated-leaf.js'], (function () {
	'use strict';
	var fortyTwo, four;
	return {
		setters: [function (module) {
			fortyTwo = module.default;
			four = module.four;
		}, null],
		execute: (function () {

			console.log('from import:', fortyTwo, four);

		})
	};
}));
