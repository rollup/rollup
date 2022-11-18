import { lib as bar } from './other';
const foo = console.log;

foo(); // removed
bar.baz(); // removed
bar(); // not removed
bar.quuz(); // not removed
bar?.baz(); // removed
