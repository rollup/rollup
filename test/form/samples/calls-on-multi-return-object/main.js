var errorContextModule = {};
var hasRequiredErrorContext;

function requireErrorContext() {
	if (hasRequiredErrorContext) return errorContextModule;
	hasRequiredErrorContext = 1;
	errorContextModule.errorContext = void 0;
	errorContextModule.errorContext = function (cb) {
		cb();
	};
	return errorContextModule;
}

var errorContext = /* @__PURE__ */ requireErrorContext();

var emitted = false;
errorContext.errorContext(function () {
	emitted = true;
});
console.log(emitted);
