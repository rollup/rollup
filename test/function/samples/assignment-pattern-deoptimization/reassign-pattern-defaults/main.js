var foo = {x: true};
var {bar: bar = foo} = {};

bar.x = false;

if (foo.x) assert.fail('foo was not reassigned');
