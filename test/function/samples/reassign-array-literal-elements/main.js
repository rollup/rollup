var foo = {x: true};
var bar = {x: true};
var baz = [foo, bar];

baz[0].x = false;
baz[1].x = false;

if (foo.x) assert.fail('foo was not reassigned');
