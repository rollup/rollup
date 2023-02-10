class Main {
	constructor() {
		this.a = 1;
	}
}
const b = new Main();
assert.ok(b);

function Foo() {
	this.a = 1;
}
const d = new Foo();
assert.ok(d);
