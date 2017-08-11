import { Foo, Bar } from './foo';

assert.equal( new Foo(5).value, 5 );

assert.throws( function () {
	Bar(5);
}, /^TypeError: Cannot set property 'value' of undefined$/ );
