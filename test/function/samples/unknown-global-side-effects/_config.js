module.exports = {
	description: 'does not omit side-effects from unknown globals',
	exports(exports) {
		let error;
		try {
			exports.max(1, 2);
		} catch (err) {
			error = err;
		}
		if (!(error instanceof ReferenceError)) {
			throw new Error('Expected a ReferenceError to be thrown.');
		}
	}
};
