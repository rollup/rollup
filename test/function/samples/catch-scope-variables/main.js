var outsideVar = 'outside';
let outsideLet = 'outside';

try {
	throw new Error();
} catch (e) {
	var outsideVar = 'inside';
	let outsideLet = 'inside';
	var insideVar = 'inside';
}

assert.equal(outsideVar, 'inside');
assert.equal(outsideLet, 'outside');
assert.equal(insideVar, 'inside');
