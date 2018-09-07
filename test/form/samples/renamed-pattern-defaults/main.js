import './dep.js';

const EMPTY = null;
const {foo = EMPTY} = {};
console.log(foo);
