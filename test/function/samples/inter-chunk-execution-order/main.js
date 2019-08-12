import './chunk1.js';
import './dep.js';

assert.equal(++execution.index, 4);
