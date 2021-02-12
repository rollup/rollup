System.register('bundle', [], function (exports) {
	'use strict';
	return {
		execute: function () {

			exports({
				bar1: void 0,
				bar2: void 0,
				foo1: void 0,
				foo2: void 0
			});

			// Unassigned export
			var foo1;

			// Reassigned uninitialised export
			bar1 = exports('bar1', 1);
			var bar1;

			// Reassigned initialised export
			var baz1 = exports('baz1', 1);
			baz1 = exports('baz1', 2);

			// Unassigned export
			var kept1, foo2, kept2;

			// Reassigned uninitialised export
			var kept1, bar2, kept2;
			bar2 = exports('bar2', 1);

			// Reassigned initialised export
			var kept1, baz2 = exports('baz2', 1), kept2;
			baz2 = exports('baz2', 2);

			console.log( kept1, kept2 );

		}
	};
});
