import { a } from 'a' with { type: 'a', extra: 'extra' };
import * as b from 'b' with { type: 'b' };
export { c } from 'c' with { type: 'c' };
export * from 'd' with { type: 'd' };
import 'e';

console.log(a, b, d);
import('f', { with: { type: 'f' } });
import('g');
