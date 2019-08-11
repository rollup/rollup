var bar = {x: true};
var foo = bar;
reassignFooX();

var baz = {x: true};
var foo = baz;
reassignFooX();

function reassignFooX() {
	foo.x = false;
}

if (bar.x) assert.fail('bar was not reassigned');
if (baz.x) assert.fail('baz was not reassigned');
