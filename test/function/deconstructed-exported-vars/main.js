let { a, b } = c(), [ d, e ] = f();

function c () {
	return { a: 1, b: 2 };
}

function f () {
	return [ 4, 5 ];
}

export { a, d };
