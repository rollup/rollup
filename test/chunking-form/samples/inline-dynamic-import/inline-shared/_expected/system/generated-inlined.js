System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			console.log('inlined');
			const value = exports('value', 'inlined');

		}
	};
});
