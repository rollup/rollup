System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var bodyVar; exports("bodyVar", bodyVar);
			for (const ignored of [1]) var bodyVar = exports("bodyVar", 3);

			var bodyIn; exports("bodyIn", bodyIn);
			for (const key in { a: 1 }) var bodyIn = exports("bodyIn", 4);

			var current; exports("current", current);
			for (var current of [1]) { exports("current", current);
				// nothing
			}

			var inKey; exports("inKey", inKey);
			for (var inKey in { a: 1 }) { exports("inKey", inKey);
				// nothing
			}

			var index; exports("index", index);
			for (var index = exports("index", 0); index < 2; (exports("index", index + 1), index++)) {
				// nothing
			}

			var first, second; exports({ first: first, second: second });
			for (var first = exports("first", 1), second = exports("second", 2); first < 2; (exports("first", first + 1), first++)) {
				// nothing
			}

			var bodyA, bodyB; exports({ bodyA: bodyA, bodyB: bodyB });
			for (const value of [1]) var bodyA = exports("bodyA", value), bodyB = exports("bodyB", value);

			var sideEffectA; exports("sideEffectA", sideEffectA);
			sideEffect(); var sideEffectA = exports("sideEffectA", 1);

			var emptyPatternA; exports("emptyPatternA", emptyPatternA);
			if (globalThis.condition) var emptyPatternA = exports("emptyPatternA", 1);

			var deadBranch; exports("deadBranch", deadBranch);
			exports("deadBranch", deadBranch = 1);
			var deadBranch; 

			var branchA, branchB; exports({ branchA: branchA, branchB: branchB });
			if (globalThis.condition) var branchA = exports("branchA", 1), branchB = exports("branchB", 2);

			var alternateA, alternateB; exports({ alternateA: alternateA, alternateB: alternateB });
			if (globalThis.condition) ; else var alternateA = exports("alternateA", 3), alternateB = exports("alternateB", 4);

		})
	};
}));
