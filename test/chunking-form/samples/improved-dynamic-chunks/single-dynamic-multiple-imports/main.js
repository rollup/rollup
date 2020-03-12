import { value } from './dep.js';
import './a.js';
console.log('main', value);
import('./dynamic.js');
export { value };
