import * as lib1 from './lib1';
import { x, y, z } from './lib2';
import x3 from './lib3a';
import y3 from './lib3b';
import z3 from './lib3c';

lib1.y.a.b = () => console.log( 'effect' );
lib1.x.a.b();
lib1.z.a.b = () => {};

y.a.b = () => console.log( 'effect' );
x.a.b();
z.a.b = () => {};

y3.a.b = () => console.log( 'effect' );
x3.a.b();
z3.a.b = () => {};
