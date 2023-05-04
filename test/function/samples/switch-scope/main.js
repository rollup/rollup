const foo = 1;
let triggered = false;

switch (foo) {
	case 1:
		const foo = 2;
		triggered = true;
}

assert.ok(triggered);
