const a = { mutated: false };
const b = { mutated: false };
const c = { mutated: false };
const d = { mutated: false };

class Foo {
	static staticProp = () => a;
	static staticMethod() {
		return b;
	}
	prop = () => c;
	method() {
		return d;
	}
}

Foo.staticProp().mutated = true;
assert.ok(a.mutated ? true : false);

Foo.staticMethod().mutated = true;
assert.ok(b.mutated ? true : false);

const foo = new Foo();

foo.prop().mutated = true;
assert.ok(c.mutated ? true : false);

foo.method().mutated = true;
assert.ok(d.mutated ? true : false);
