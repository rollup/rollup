export var bodyVar;
for (const ignored of [1]) var bodyVar = 3;

export var current;
for (var current of [1]) {
	// nothing
}

export var index;
for (var index = 0; index < 2; index++) {
	// nothing
}
