import bar from './bar';

function test( foo ) {
	assert.equal(foo, 1);
	return bar();
}

assert.equal( test(1), 'consistent' );
