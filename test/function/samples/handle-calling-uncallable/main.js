import foo from './foo.js';

assert.throws( function () {
	foo();
}, /is not a function/ );
