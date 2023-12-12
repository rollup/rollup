System.register('bundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			// Unassigned export
			var foo1; exports("foo1", foo1);

			// Reassigned uninitialised export
			exports("bar1", bar1 = 1);
			var bar1; exports("bar1", bar1);

			// Reassigned initialised export
			var baz1 = exports("baz1", 1);
			exports("baz1", baz1 = 2);

			// Unassigned export
			var kept1, foo2, kept2; exports("foo2", foo2);

			// Reassigned uninitialised export
			var kept1, bar2, kept2; exports("bar2", bar2);
			exports("bar2", bar2 = 1);

			// Reassigned initialised export
			var kept1, baz2 = exports("baz2", 1), kept2;
			exports("baz2", baz2 = 2);

			console.log( kept1, kept2 );

		})
	};
}));
