import { fn, dynamic } from './dep1.js';

console.log(fn(5));

dynamic(10).then(num => {
  console.log(num);
});