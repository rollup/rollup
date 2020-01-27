import { value } from './dep.js';

console.log('dynamic1', value);
import('./dynamic2.js');
export { value };
