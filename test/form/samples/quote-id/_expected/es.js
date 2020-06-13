import { foo } from 'quoted\'\r\n\u2028\u2029external1';
import { bar } from './quoted\'\r\n\u2028\u2029external2';

console.log(foo, bar);
