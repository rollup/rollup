module.exports = defineTest({
	description: 'sets AMD module ID and define function',
	spawnArgs: ['-i', 'main.js', '-f', 'amd', '--amd.id', 'foo', '--amd.define', 'defn']
});
