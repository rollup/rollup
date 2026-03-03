import { a } from 'a' with { type: 'changed', extra: 'changed' };
import * as b from 'b' with { type: 'changed' };
export { c } from 'c' with { type: 'changed' };
export * from 'd' with { type: 'changed' };
import 'e';

console.log(a, b, d);
import('f', { with: { type: 'changed' } });
import('g');
