System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var dep =
				/*#__PURE__*/
				exports('a', (function() {
					return 0;
				})());

		}
	};
});
