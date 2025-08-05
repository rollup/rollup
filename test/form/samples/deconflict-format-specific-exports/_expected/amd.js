define(['exports'], (function (exports) { 'use strict';

	const exports$1 = {
		x: 42
	};
	console.log(exports$1);

	function nestedConflict() {
		const exports$1 = {
			x: 42
		};
		console.log(exports$1);
		exports.x++;
	}

	function nestedNoConflict() {
		const exports$1 = {
			x: 42
		};
		console.log(exports$1);
	}

	exports.x = 43;
	nestedConflict();
	nestedNoConflict();

}));
