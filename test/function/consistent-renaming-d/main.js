import Foo from './foo';
import bar from './bar';

var baz = Foo.baz();
assert.ok( baz.isBaz );
assert.ok( bar().inheritsFromBaz );
