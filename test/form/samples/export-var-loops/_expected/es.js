var bodyVar;
for (const ignored of [1]) var bodyVar = 3;

var bodyIn;
for (const key in { a: 1 }) var bodyIn = 4;

var current;
for (var current of [1]) {
	// nothing
}

var inKey;
for (var inKey in { a: 1 }) {
	// nothing
}

var index;
for (var index = 0; index < 2; index++) {
	// nothing
}

var first, second;
for (var first = 1, second = 2; first < 2; first++) {
	// nothing
}

var bodyA, bodyB;
for (const value of [1]) var bodyA = value, bodyB = value;

var sideEffectA;
sideEffect(); var sideEffectA = 1;

var emptyPatternA;
if (globalThis.condition) var emptyPatternA = 1;

var deadBranch;
deadBranch = 1;
var deadBranch; 

var branchA, branchB;
if (globalThis.condition) var branchA = 1, branchB = 2;

var alternateA, alternateB;
if (globalThis.condition) ; else var alternateA = 3, alternateB = 4;

export { alternateA, alternateB, bodyA, bodyB, bodyIn, bodyVar, branchA, branchB, current, deadBranch, emptyPatternA, first, inKey, index, second, sideEffectA };
