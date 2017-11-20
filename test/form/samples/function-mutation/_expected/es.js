function foo () {
	console.log( 'foo' );
}

const bar = function () {
	console.log( 'bar' );
};

const baz = () => console.log( 'baz' );

function a () {
	console.log( 'a' );
}

a.foo = foo;

const c = function () {
	console.log( 'c' );
};
c.bar = bar;

const e = () => console.log( 'e' );
e.baz = baz;

class g {
	constructor () {
		console.log( 'g' );
	}
}

g.foo = foo;

const i = class {
	constructor () {
		console.log( 'i' );
	}
};
i.foo = foo;

export { a, c, e, g, i };
