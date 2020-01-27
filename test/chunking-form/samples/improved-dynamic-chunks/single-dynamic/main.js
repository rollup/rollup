import { value } from './dep.js';
console.log('main', value);
import('./dynamic.js');
export { value };
