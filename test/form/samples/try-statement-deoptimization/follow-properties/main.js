const helpers = {
	fails: exec => {
		try {
			exec();
			return false;
		} catch {
			return true;
		}
	}
};

const detection = helpers.fails(() => {
	Object.getPrototypeOf(null);
});
console.log(detection);

// The pure annotation allows the call to be dropped together with its
// dependencies as the return value is not used.
const unused = /*#__PURE__*/ helpers.fails(() => {
	console.log('this is never run');
});
