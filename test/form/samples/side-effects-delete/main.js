var x = {foo: 'bar'};
delete x.foo;

var y = {foo: 'bar'};
delete y.foo;

delete globalThis.unknown.foo;

export {x};
