var foo = { bar: { baz: 5 } };
var arr = [ { quux: 'wrong' }, { quux: 17 } ];

export var { bar: { baz } } = foo;
export var [ /* skip */, { quux } ] = arr;
