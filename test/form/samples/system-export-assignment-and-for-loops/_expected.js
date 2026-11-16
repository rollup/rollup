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
				for (current of ['a', 'b'])exports("current", current);
				for (key in { k: 1 })exports("key", key);
				for ([first, second] of [['x', 'y']])exports({ first: first, second: second });
				for ({ prop } of [{ prop: 'p' }])exports("prop", prop);
				for (seen of ['a', 'b']) { exports("seen", seen);
					exports("joined", joined += seen);
				}
				for (const ignored of ['nope']);
			}

			var declaredOf; exports("declaredOf", declaredOf);
			for (var declaredOf of ['a', 'b']) { exports("declaredOf", declaredOf);
				console.log(declaredOf);
			}
			for (var separateOf of ['c', 'd'])exports("separateOf", separateOf);

			var declaredIn; exports("declaredIn", declaredIn);
			for (var declaredIn in { k: 1 }) { exports("declaredIn", declaredIn);
				console.log(declaredIn);
			}

			var patternA, patternB; exports({ patternA: patternA, patternB: patternB });
			for (var [patternA, patternB] of [['x', 'y']])exports({ patternA: patternA, patternB: patternB });

			var patternProp; exports("patternProp", patternProp);
			for (var { patternProp } of [{ patternProp: 'p' }])exports("patternProp", patternProp);

			var withDefault; exports("withDefault", withDefault);
			for (var { withDefault = 'fallback' } of [{}])exports("withDefault", withDefault);

			var inlineVar = exports("inlineVar", '');
			for (var inlineVar of ['q']) { exports("inlineVar", inlineVar); exports("inlineVar", inlineVar += '!'); }

			var shadowedVar; exports("shadowedVar", shadowedVar);
			for (var shadowedVar of ['outer']) { exports("shadowedVar", shadowedVar); {
				let shadowedVar = 'inner';
				console.log(shadowedVar);
			} }

			var renamedVar; exports("renamedVar", renamedVar);
			for (var renamedVar of ['z']) { exports("renamedVar", renamedVar); {
				let exports = 1;
				console.log(exports);
			} }

			run();

		})
	};
}));
