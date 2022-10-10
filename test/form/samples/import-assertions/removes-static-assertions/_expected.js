import { a } from 'a';
import * as b from 'b';
export { c } from 'c';
export * from 'd';
import 'unresolved';

console.log(a, b, d);
