var x = {foo: 'bar'};
delete x.foo;

delete globalThis.unknown.foo;

export { x };
