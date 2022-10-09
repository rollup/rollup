import { a } from 'a' assert { type: 'changed', extra: 'changed' };
import * as b from 'b' assert { type: 'changed' };
export { c } from 'c' assert { type: 'changed' };
export * from 'd' assert { type: 'changed' };
import 'e';

console.log(a, b, d);
import('f', { assert: { type: 'changed' } });
import('g');
