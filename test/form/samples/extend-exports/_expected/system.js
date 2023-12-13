System.register('foo', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const answer = exports("answer", 42);

		})
	};
}));
