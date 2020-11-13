module.exports = {
	description:
		'sets AMD module ID for each chunk appended with chunk id when there is code splitting and `idFromChunkName` option',
	command: 'rollup -i main.js -f amd --amd.id "foo/" --amd.idFromChunkName'
};
