System.register('bundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const a = exports("a", window.config ? 1 : 2);
			const b = exports("b", 1 );
			const c = exports("c", 2);

		})
	};
}));
