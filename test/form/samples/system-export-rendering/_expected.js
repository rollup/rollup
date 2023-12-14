System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			// ---
			// Single export name
			let foo = exports("foo", 1);

			// Assignment
			// foo = 2
			exports("foo", foo = 2);
			console.log(exports("foo", foo = 2));

			// foo += 2
			exports("foo", foo += 2);
			console.log(exports("foo", foo += 2));

			// { foo } = obj
			(function (v) { return exports("foo", foo), v; }({ foo } = obj));
			console.log(function (v) { return exports("foo", foo), v; }({ foo } = obj));

			// Update
			// foo++
			exports("foo", foo + 1), foo++;
			console.log((exports("foo", foo + 1), foo++));
			exports("foo", foo - 1), foo--;

			// ++foo
			exports("foo", ++foo);
			console.log(exports("foo", ++foo));
			exports("foo", --foo);

			// ---
			// Multiple export names
			let bar = 1; exports({ bar: bar, bar2: bar });

			// Assignment
			// bar = 2
			bar = 2, exports({ bar: bar, bar2: bar }), bar;
			console.log((bar = 2, exports({ bar: bar, bar2: bar }), bar));

			// bar += 2
			bar += 2, exports({ bar: bar, bar2: bar }), bar;
			console.log((bar += 2, exports({ bar: bar, bar2: bar }), bar));

			// { bar } = obj
			(function (v) { return exports({ bar: bar, bar2: bar }), v; }({ bar } = obj));
			console.log(function (v) { return exports({ bar: bar, bar2: bar }), v; }({ bar } = obj));

			// Update
			// bar++
			exports({ bar: bar + 1, bar2: bar + 1 }), bar++;
			console.log((exports({ bar: bar + 1, bar2: bar + 1 }), bar++));
			exports({ bar: bar - 1, bar2: bar - 1 }), bar--;

			// ++bar
			++bar, exports({ bar: bar, bar2: bar }), bar;
			console.log((++bar, exports({ bar: bar, bar2: bar }), bar));
			--bar, exports({ bar: bar, bar2: bar }), bar;

		})
	};
}));
