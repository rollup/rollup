import { s as square } from './generated-square.js';

async function doMaths() {
	const maths = await import('./generated-maths.js');
	assert.equal(maths.square(5), 25);
	assert.equal(maths.cube(5), 125);
}

assert.equal(square(2), 4);
await doMaths();
