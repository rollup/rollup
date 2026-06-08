System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			// There is no reason for this to end up in a different chunk as the other dep
			const dep$1 = exports("d", 'dep1');

			// There is no reason for this to end up in a different chunk as the other dep
			const dep = exports("a", 'dep2');

		})
	};
}));
