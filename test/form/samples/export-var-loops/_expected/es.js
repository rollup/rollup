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

export { bodyIn, bodyVar, current, inKey, index };
