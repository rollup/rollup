import { a } from 'a' with { type: 'a', extra: 'extra' };
import * as b from 'b' with { type: 'b' };
export { c } from 'c' with { type: 'c' };
export * from 'd' with { type: 'd' };
import 'unresolved' with { type: 'e' };

console.log(a, b, d);


