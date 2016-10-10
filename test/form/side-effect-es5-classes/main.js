import { Foo } from './foo';
import { Bar } from './bar';
import { Baz } from './baz';
import { Qux } from './qux';
import { Corge } from './corge';
import { Arrow } from './arrow';

console.log( 'before' );

var foo = new Foo(5);
var bar = new Bar(5);
var baz = new Baz(5);
var qux = new Qux(5);
var corge = Corge(5);
var arrow = new Arrow(5);

console.log( 'after' );
