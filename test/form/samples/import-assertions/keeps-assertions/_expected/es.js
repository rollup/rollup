import { a } from 'a' assert { type: 'a' };
import { b } from 'b' assert { foo: 'bar', baz: 'quuz' };
export { c } from 'c' assert { type: 'c' };

console.log(a, b);

import('d', { assert: { type: 'd' } }).then(console.log);
