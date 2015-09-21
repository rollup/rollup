function square ( x ) {
	return x * x;
}

function cube ( x ) {
	return x * x * x;
}

Math.square = square;

if ( true ) {
	Math.cube = cube;
}

export { square };
