module.exports = defineTest({
	description: 'does not omit side-effects from unknown globals',
	exports(exports) {
		let error;
		try {
			exports.max(1, 2);
		} catch (error_) {
			error = error_;
		}
		if (!(error instanceof ReferenceError)) {
			throw new TypeError('Expected a ReferenceError to be thrown.');
		}
	}
});
