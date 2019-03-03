import external from 'external';
import internal1 from 'internal1';
import internal2 from 'internal2';

assert.strictEqual(internal1, 42);

assert.strictEqual(internal2, 42);

assert.strictEqual(external, 'external');
