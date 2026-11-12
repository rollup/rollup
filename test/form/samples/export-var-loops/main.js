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
