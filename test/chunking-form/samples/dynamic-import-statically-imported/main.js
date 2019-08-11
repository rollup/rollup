import { bar } from './dep1.js';
import { foo } from './dep2.js';

console.log(foo(), bar());
