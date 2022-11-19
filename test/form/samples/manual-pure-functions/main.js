import { lib as bar } from './other';
const foo = console.log;

foo(); // removed
bar.a(); // removed
bar?.a(); // removed

bar(); // not removed
bar.b(); // not removed

bar.a.b(); // removed
