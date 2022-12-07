import { value } from './dep.js';
console.log('main1', value);
import('./dynamic1.js');
