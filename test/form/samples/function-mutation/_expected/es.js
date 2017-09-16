function foo () {
	console.log( 'foo' );
}

function a () {
	console.log( 'a' );
}

a.foo = foo;

const bar = function () {
	console.log( 'bar' );
};

const c = function () {
	console.log( 'c' );
};

c.bar = bar;

const baz = () => console.log( 'baz' );

const e = () => console.log( 'c' );

e.baz = baz;

export { a, c, e };
