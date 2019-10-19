let result = '';

const a = { a: true };
for (const key in!0?a:a) result += key;

const b = ['b'];
for (const value of!0?b:b) result += value;

const c = 'c';
function testReturn() {
	return!0?c:c;
}
result += testReturn();

const d = 'd';
function* testYield() {
	yield!0?d:d;
}
for (const value of testYield()) result += value;

const e = 'e';
try {
	throw!0?e:e;
} catch (err) {
	result += err;
}

assert.strictEqual(result, 'abcde');
