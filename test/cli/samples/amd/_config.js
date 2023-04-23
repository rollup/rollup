module.exports = defineTest({
	description: 'sets AMD module ID and define function',
	command: 'rollup -i main.js -f amd --amd.id foo --amd.define defn'
});
