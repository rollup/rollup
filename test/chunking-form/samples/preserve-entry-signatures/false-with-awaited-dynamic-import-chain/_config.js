module.exports = defineTest({
	description:
		'keeps shared dependencies out of an awaiting entry if the dynamic entry is also imported from a chain with top-level await (#6516)',
	formats: ['es', 'system'],
	options: {
		preserveEntrySignatures: false
	}
});
