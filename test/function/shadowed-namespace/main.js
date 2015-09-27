import * as bar from './bar';

function car () {
	var bar = {
		foo: function () {
			return 42;
		}
	};
	return bar.foo();
}

assert.equal( bar.foo(), 'FUBAR' );
assert.equal( car(), 42 );
