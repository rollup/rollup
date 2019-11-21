import foo1 from 'external1';
import foo2 from 'external2';
import foo3 from 'external3';
import './dep1.js';
import './dep2.js';
import './dep3.js';
import './dep4.js';
import './dep5.js';

console.log(foo1, foo2, foo3, this, this, this, this, this, this);
export const bar = eval('foo');
