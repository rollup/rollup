const test = (a = 'fallback') => a;

let returnValue;

try {
	returnValue = test();
} catch {}

assert.strictEqual(returnValue, 'fallback');
