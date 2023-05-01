module.exports = defineTest({
	description: 'Does not call external for entry point',
	options: {
		external(id, parentId) {
			if (!parentId) throw new Error('Should not call external for entry point.');
			return true;
		}
	}
});
