import { value } from './dep.js';

console.log('dynamic1', value);
import('./dynamic1.js');
export { value };
