import { a } from 'a' assert { type: 'a' };
import { b } from 'b' assert { foo: 'bar', baz: 'quuz' };
console.log(a, b);

export { c } from 'c' assert { type: 'c' };

import('d', { assert: { type: 'd' } }).then(console.log);
