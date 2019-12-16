var foo = { x: true };
var modified = false;

try {
	var { bar: bar = foo } = {};
	bar.x = false;
	({ modified = false } = { modified: true });
} catch (err) {}

if (foo.x) assert.fail('foo was not reassigned');
if (!modified) assert.fail('reassignment was not tracked');
