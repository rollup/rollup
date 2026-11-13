export var bodyVar;
for (const ignored of [1]) var bodyVar = 3;

export var bodyIn;
for (const key in { a: 1 }) var bodyIn = 4;

export var current;
for (var current of [1]) {
	// nothing
}

export var inKey;
for (var inKey in { a: 1 }) {
	// nothing
}

export var index;
for (var index = 0; index < 2; index++) {
	// nothing
}

export var first, second;
for (var first = 1, second = 2; first < 2; first++) {
	// nothing
}

export var bodyA, bodyB;
for (const value of [1]) var bodyA = value, bodyB = value;

export var sideEffectA;
var unusedSideEffect = sideEffect(), sideEffectA = 1;

export var emptyPatternA;
if (globalThis.condition) var {} = {}, emptyPatternA = 1;

export var deadBranch;
deadBranch = 1;
if (false) var deadBranch = 2;

if (false) var plainDead = 2;

export var branchA, branchB;
if (globalThis.condition) var branchA = 1, branchB = 2;

export var alternateA, alternateB;
if (globalThis.condition) {
} else var alternateA = 3, alternateB = 4;
