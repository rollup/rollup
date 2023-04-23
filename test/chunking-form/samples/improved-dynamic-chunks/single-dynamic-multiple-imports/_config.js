module.exports = defineTest({
	description:
		'does not create a separate chunk if a dynamically imported chunk shares a dependency with its importer, and dynamic chunk imported from multiple places'
});
