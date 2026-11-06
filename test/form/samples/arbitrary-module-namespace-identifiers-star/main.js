import { '*' as externalStar } from 'external';
import { '*' as star } from './dep.js';
import * as dep from './dep.js';

console.log(externalStar, star, dep['**'], '*' in dep, '*x' in dep, dep);

const legal = 10;
export { legal as '*' };
export { '*' as reexportedStar, '*' as '**' } from 'external';
export { default as '*default' } from './dep.js';
export * from 'external';
