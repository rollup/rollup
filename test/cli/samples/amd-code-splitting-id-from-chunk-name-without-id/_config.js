module.exports = {
	description:
		'sets AMD module ID for each chunk as the chunk id when there is code splitting and `idFromChunkName` option',
	command: 'rollup -i main.js -f amd --amd.idFromChunkName'
};
