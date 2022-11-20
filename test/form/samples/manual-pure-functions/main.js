import { lib as bar } from './other';

foo; // removed
foo(); // removed
foo.a; // removed
foo.a(); // removed
foo.a()(); // removed
foo.a().a; // removed
foo.a().a(); // removed
foo.a().a()(); // removed
foo.a().a().a; // removed
foo.a().a().a(); // removed

bar(); // not removed
bar.b(); // not removed

bar.a(); // removed
bar?.a(); // removed
bar.a.a; // removed
bar.a.a(); // removed
bar.a()(); //removed
bar.a().a; //removed
bar.a().a(); //removed
bar.a()()(); //removed
bar.a()().a; //removed
bar.a()().a(); //removed

