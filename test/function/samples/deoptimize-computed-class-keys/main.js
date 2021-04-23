var key1 = 'x';
var key2 = 'y';

changeKeys();

class Foo {
	static [key1] = true;
	static [key2] = false;
}

assert.strictEqual(Foo.x, false);
assert.strictEqual(Foo.y, true);

function changeKeys() {
	key1 = 'y';
	key2 = 'x';
}
