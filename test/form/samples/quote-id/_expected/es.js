import { foo } from 'quoted\'\\
\ \ external1';
import { bar } from 'quoted\'\\
\ \ external2';
import { baz } from 'C:\\File\\Path.js';

console.log(foo, bar, baz);
