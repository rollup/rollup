import plain from './data.js';
import composite from './data.js' with { type: 'composite' };
import object from './data.js' with { type: 'object' };

assert.deepEqual([plain, composite, object], ['data', 'data', 'data']);
