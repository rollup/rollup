System.register('module-name-with-dashes', [], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			let foo = exports('foo', 'foo');

		}
	};
});
