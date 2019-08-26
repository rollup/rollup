import { foo } from 'unchanged';
import changedName from 'changed';
import { bar } from 'special-character';
import { baz } from 'with/slash';
import { quux } from './relative.js';

console.log(foo, changedName, bar, baz, quux);
