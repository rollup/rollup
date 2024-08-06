module.exports = defineTest({
	description: 'handles optional chaining with namespace',
	options: {
		onLog(_level, log) {
			if (log.code !== 'MISSING_EXPORT') {
				throw new Error(`Unexpected log code: ${log.code}`);
			}
		}
	}
});
