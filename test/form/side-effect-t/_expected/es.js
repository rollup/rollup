function x () {
	return new Promise( ( resolve, reject ) => {
		console.log( 'this is a side-effect' );
		resolve();
	});
}

x();

function promiseCallback ( resolve, reject ) {
	console.log( 'this is a side-effect' );
	resolve();
}

function y () {
	return new Promise( promiseCallback );
}

y();

function z ( x ) {
	// this function has no side-effects, so should be excluded...
}

let a = 1;
z( a += 1 ); // ...unless the call expression statement has its own side-effects

export { a };
