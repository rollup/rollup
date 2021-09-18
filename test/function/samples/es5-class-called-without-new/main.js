import { Foo, Bar } from './foo';

assert.equal( new Foo(5).value, 5 );

assert.throws(() => Bar(5), /^TypeError: Cannot set propert.*'value'.*$/ );
