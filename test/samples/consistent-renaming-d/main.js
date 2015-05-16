import Foo from './foo';
import bar from './bar';

const baz = Foo.baz();
assert.ok( baz.isBaz );
assert.ok( bar().inheritsFromBaz );