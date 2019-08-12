module.exports = {
	description: 'Does not call external for entry point',
	options: {
		external (id, parentId, isResolved) {
			if (!parentId)
				throw new Error('Should not call external for entry point.');
			return true;
		}
	}
};
