var fails;
var hasRequiredFails;
function requireFails() {
	if (hasRequiredFails) return fails;
	hasRequiredFails = 1;
	fails = function (exec) {
		try {
			exec();
			return false;
		} catch {
			return true;
		}
	};
	return fails;
}

const detection = requireFails()(function () {
});
console.log(detection);

// The callback of a reassigned helper without a try-statement is still
// tree-shaken
var noTryHelper;
noTryHelper = callback => {
	return callback();
};
noTryHelper(function () {
});

// The callback of an unknown global function is still tree-shaken
globalThis.registerHandler(function () {
});
