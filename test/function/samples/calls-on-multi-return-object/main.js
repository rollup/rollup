var wrapperModule = {};
var hasRequiredWrapper;

function requireWrapper() {
	if (hasRequiredWrapper) return wrapperModule;
	hasRequiredWrapper = 1;
	wrapperModule.run = function (cb) {
		cb();
	};
	return wrapperModule;
}

var wrapper = /* @__PURE__ */ requireWrapper();

var calls = 0;
wrapper.run(function () {
	calls++;
});
assert.strictEqual(calls, 1);
