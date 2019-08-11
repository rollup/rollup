import { missing1 } from './dep1.js';
import { missing2, previousShimmedExport } from './dep2.js';

console.log(missing1, missing2, previousShimmedExport);
