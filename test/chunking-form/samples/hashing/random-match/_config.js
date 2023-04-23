module.exports = defineTest({
	description: 'leaves random hash matches untransformed',
	options: {
		output: {
			entryFileNames: 'entry-[hash]-!~{001}~-!~{123}~.js'
		}
	}
});
