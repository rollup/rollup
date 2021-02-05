let calls = 0;

Function.prototype.testFunc = () => {
	calls++;
	return { test: () => calls++ };
};

var x = function () {}.testFunc();
var y;
y = function () {}.testFunc().test();

delete Object.prototype.testFunc;
assert.strictEqual(calls, 3);
