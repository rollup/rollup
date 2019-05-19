System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			const firebase = {};
			exports('a', firebase);

			exports('b', firebase);

		}
	};
});
