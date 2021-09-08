import foo, * as ns from 'external';
import * as other from './other';
import { missing } from './other';
console.log(foo, ns, other, bar, missing);
export * from 'external';
export default 42;
