import foo from './foo.js';

function x () {
	const answer = foo();
	return { answer };
}

assert.equal( x().answer, 42 );
