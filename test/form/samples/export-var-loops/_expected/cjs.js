'use strict';

exports.bodyVar = void 0;
for (const ignored of [1]) exports.bodyVar = 3;

exports.bodyIn = void 0;
for (const key in { a: 1 }) exports.bodyIn = 4;

exports.current = void 0;
for (exports.current of [1]) {
	// nothing
}

exports.inKey = void 0;
for (exports.inKey in { a: 1 }) {
	// nothing
}

exports.index = void 0;
for (exports.index = 0; exports.index < 2; exports.index++) {
	// nothing
}

var first, second;
for (var first = 1, second = 2; first < 2; first++) {
	// nothing
}

var bodyA, bodyB;
for (const value of [1]) var bodyA = value, bodyB = value;

exports.sideEffectA = void 0;
sideEffect(); exports.sideEffectA = 1;

var emptyPatternA;
if (globalThis.condition) var emptyPatternA = 1;

exports.deadBranch = void 0;
exports.deadBranch = 1;


var branchA, branchB;
if (globalThis.condition) var branchA = 1, branchB = 2;

var alternateA, alternateB;
if (globalThis.condition) ; else var alternateA = 3, alternateB = 4;

exports.alternateA = alternateA;
exports.alternateB = alternateB;
exports.bodyA = bodyA;
exports.bodyB = bodyB;
exports.branchA = branchA;
exports.branchB = branchB;
exports.emptyPatternA = emptyPatternA;
Object.defineProperty(exports, "first", {
	configurable: true,
	enumerable: true,
	get: function () { return first; }
});
exports.second = second;
