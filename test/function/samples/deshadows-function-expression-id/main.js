import { foo as _foo } from './foo.js';

function Thing () {};

Thing.prototype.foo = function foo () {
	return _foo();
};

assert.equal( new Thing().foo(), 'works' );
