var foo = { x: true };
var bar = { x: true };

try {
	var baz = [foo, bar];
	baz[0].x = false;
	baz[1].x = false;
} catch (err) {}

if (foo.x) assert.fail('foo was not reassigned');
if (bar.x) assert.fail('bar was not reassigned');
