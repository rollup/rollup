import * as dep from './dep.js';
import * as main from './main.js';
import { 'external:\nfoo\'"`' as foo } from 'external';

console.log(foo, main, dep);

export const bar = 42;
const one = 43;
class C {}

export const 你好 = 44;

export { one as '1', bar as 'bar:\nfrom main\'"`', C as 'class:\nfrom main\'"`' };
export * from './dep';
export * as 'external:\nnamespace\'"`' from 'external';
export { 'external:\nre-exported\'"`' } from 'external';
