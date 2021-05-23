var key1 = 'x'
var key2 = 'y'

changeKeys();

var foo = { [key1]: true, [key2]: false };

assert.strictEqual(foo.x, false);
assert.strictEqual(foo.y, true);

function changeKeys() {
	key1 = 'y'
	key2 = 'x'
}