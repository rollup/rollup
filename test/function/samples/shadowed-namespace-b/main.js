import * as bar from './bar';

function car () {
	var foo = function () {
		return 'nope';
	};
	return bar.foo();
}

assert.equal( car(), 42 );
