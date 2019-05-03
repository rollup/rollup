import {value} from './dep.js';

console.log('main2', value);

export { value as reexported };
