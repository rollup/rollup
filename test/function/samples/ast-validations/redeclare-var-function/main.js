let modified = false;

var foo = () => (modified = true);
function foo() {}

foo();
assert.ok(modified);
