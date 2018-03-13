System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var self = {
				get p () { return p$$1; }
			};
			if (typeof Symbol !== 'undefined' && Symbol.toStringTag)
				Object.defineProperty(self, Symbol.toStringTag, { value: 'Module' });
			else
				Object.defineProperty(self, 'toString', { value: function () { return '[object Module]' } });
			Object.freeze(self);

			console.log(Object.keys(self));

			var p$$1 = exports('p', 5);

		}
	};
});
