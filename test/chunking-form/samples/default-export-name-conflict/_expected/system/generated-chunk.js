System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			const firebase = {};
			exports('a', firebase);

			exports('b', firebase);

		}
	};
});
