let calls = 0;

Function.prototype.testFunc = () => {
	calls++;
	return { test: () => calls++ };
};

var x = class {}.testFunc();
var y;
y = class {}.testFunc().test();

delete Object.prototype.testFunc;
assert.strictEqual(calls, 3);
