import { foo } from './foo';

function bar () {
	return 'main-bar';
}

assert.equal( bar(), 'main-bar' );
assert.equal( foo.bar(), 'foo-bar' );
