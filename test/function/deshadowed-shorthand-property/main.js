import foo from './foo.js';

function x () {
	var answer = foo();
	return { answer };
}

assert.equal( x().answer, 42 );
