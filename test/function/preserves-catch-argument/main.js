import { dirname as i } from 'path';

function foo (path) {
	const dir = i(path);
	try {
		throw new Error('something went wrong');
	} catch (i) {
		assert.equal(i.message, 'something went wrong');
	}
}

foo('');