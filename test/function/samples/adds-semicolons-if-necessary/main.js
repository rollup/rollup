import { foo } from './foo.js';

(function bar() {
	assert.ok( true );
})();

assert.equal( foo(), 42 );
