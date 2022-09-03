module.exports = {
	description: 'leaves random hash matches untransformed',
	options: {
		output: {
			entryFileNames: 'entry-[hash]-_!~{0001}~-_!~{1234}~.js'
		}
	}
};
