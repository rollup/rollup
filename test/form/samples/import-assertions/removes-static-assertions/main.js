import { a } from 'a' assert { type: 'a', extra: 'extra' };
import * as b from 'b' assert { type: 'b' };
export { c } from 'c' assert { type: 'c' };
export * from 'd' assert { type: 'd' };
import 'unresolved' assert { type: 'e' };

console.log(a, b, d);


