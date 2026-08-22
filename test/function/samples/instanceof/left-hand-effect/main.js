let effect1 = false;
let effect2 = false;

class Bar {}
class Foo {
	constructor() {
		effect1 = true;
	}
}

function FnBar() {}
function FnFoo() {
	effect2 = true;
}

if (new Foo() instanceof Bar) {
	assert.fail('Wrong instance relation');
}

if (new FnFoo() instanceof FnBar) {
	assert.fail('Wrong instance relation');
}

assert.ok(effect1);
assert.ok(effect2);
