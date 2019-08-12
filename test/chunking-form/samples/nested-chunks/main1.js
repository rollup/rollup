import { value } from './dep.js';

console.log('main1', value);

import('./dynamic.js').then(result => console.log(result));
import('./external.js').then(result => console.log(result));
