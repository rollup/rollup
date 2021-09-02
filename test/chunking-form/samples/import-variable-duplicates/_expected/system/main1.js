System.register(['./first.js'], (function () {
	'use strict';
	var head2;
	return {
		setters: [function (module) {
			head2 = module["default"];
		}],
		execute: (function () {

			console.log(head2);
			console.log(head2);

		})
	};
}));
