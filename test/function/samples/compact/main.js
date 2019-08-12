import x from 'external';
import * as self from './main.js';

assert.equal(self && self['de' + 'fault'](), 42);

export default function foo() {
	return x;
}

import('./main.js').then(self => {
	assert.equal(self && self['de' + 'fault'](), 42);
});
