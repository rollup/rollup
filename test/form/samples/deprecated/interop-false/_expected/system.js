System.register('foo', ['core/view'], (function (exports) {
	'use strict';
	var View;
	return {
		setters: [function (module) {
			View = module.default;
		}],
		execute: (function () {

			var main = exports('default', View.extend({}));

		})
	};
}));
