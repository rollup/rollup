let calls = 0;

Object.prototype.testFunc = () => {
	calls++;
	return { test: () => calls++ };
};

var x = {}.testFunc();
var y;
y = {}.testFunc().test();

delete Object.prototype.testFunc;
assert.strictEqual(calls, 3);
