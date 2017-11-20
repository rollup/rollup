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

function b () {
	console.log( 'b' );
}

b.foo = foo;

const c = function () {
	console.log( 'c' );
};
c.bar = bar;

const d = function () {
	console.log( 'd' );
};
d.bar = bar;

const e = () => console.log( 'e' );
e.baz = baz;

const f = () => console.log( 'f' );
f.baz = baz;

class g {
	constructor () {
		console.log( 'g' );
	}
}

g.foo = foo;

class h {
	constructor () {
		console.log( 'g' );
	}
}

h.foo = foo;

const i = class {
	constructor () {
		console.log( 'i' );
	}
};
i.foo = foo;

const j = class {
	constructor () {
		console.log( 'j' );
	}
};
j.foo = foo;

export { a, c, e, g, i };
