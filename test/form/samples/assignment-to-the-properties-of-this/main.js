class Main {
	constructor() {
		this.a = 1;
	}
}
const a = new Main(); // removed
const b = new Main();
assert.ok(b);

function Foo() {
	this.a = 1;
}

const c = new Foo(); // removed
const d = new Foo();
assert.ok(d);
