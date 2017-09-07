function foo () {
	console.log( 'foo' );
}

function a () {
	console.log( 'a' );
}

a.foo = foo;

function b () {
	console.log( 'b' );
}

b.foo = foo;

const bar = function () {
	console.log( 'bar' );
};

const c = function () {
	console.log( 'c' );
};

c.bar = bar;

const d = function () {
	console.log( 'd' );
};

d.bar = bar;

const baz = () => console.log( 'baz' );

const e = () => console.log( 'c' );

e.baz = baz;

const f = () => console.log( 'd' );

f.baz = baz;

export { a, c, e };