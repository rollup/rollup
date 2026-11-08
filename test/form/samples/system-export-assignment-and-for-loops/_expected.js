System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			exports({
				reset: reset,
				run: run
			});

			let count = exports("count", 0);
			function reset(values) {
				(function (v) { return exports("count", count), v; })([count] = values);
			}

			let name = exports("name", '');
			(function (v) { return exports("name", name), v; }({ name } = { name: 'ok' }));

			let current, key, first, second, prop, seen; exports({ current: current, key: key, first: first, second: second, prop: prop, seen: seen });
			let joined = exports("joined", '');

			function run() {
				for (current of ['a', 'b']) exports("current", current);
				for (key in { k: 1 }) exports("key", key);
				for ([first, second] of [['x', 'y']]) exports({ first: first, second: second });
				for ({ prop } of [{ prop: 'p' }]) exports("prop", prop);
				for (seen of ['a', 'b']) { exports("seen", seen); {
					exports("joined", joined += seen);
				} }
				for (const ignored of ['nope']);
			}

			run();

		})
	};
}));
