System.register([], (function () {
	'use strict';
	return {
		execute: (function () {

			const a = 1;
			const b = 2;
			const { c = a } = {};
			const [ d = b ] = [];
			console.log(c, d);

		})
	};
}));
