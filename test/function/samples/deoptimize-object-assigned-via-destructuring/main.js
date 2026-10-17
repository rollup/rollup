var y;
const t = ({ y } = { z: 1 });
t.z = 2;

let branch;
if (t.z === 1) {
	branch = 'then';
} else {
	branch = 'else';
}

assert.equal(t.z, 2, 'mutation through the destructuring assignment value is lost');
assert.equal(branch, 'else', 'the wrong branch was statically selected');
