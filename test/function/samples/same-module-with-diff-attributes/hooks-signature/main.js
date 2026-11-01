import { foo } from './foo.js' with { type: 'foo-type' };
import { quz } from './quz.js';
import asset from 'asset';

assert.ok(foo);
assert.ok(quz);
assert.ok(asset);

import('./bar.js', { type: 'bar-type' }).then(res => {
	console.log(res);
});
