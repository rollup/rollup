const fs = require('fs');
const path = require('path');

let mainFile;

module.exports = {
	description: 'recovers from errors during bundling',
	command: 'rollup -cw',
	before() {
		mainFile = path.resolve(__dirname, 'main.js');
		fs.writeFileSync(mainFile, '<=>');
	},
	after() {
		setTimeout(() => fs.unlinkSync(mainFile), 100);
	},
	abortOnStderr(data) {
		if (data.includes('Error: Unexpected token')) {
			setTimeout(() => fs.writeFileSync(mainFile, 'export default 42;'), 500);
			return false;
		}
		if (data.includes('created _actual')) {
			return true;
		}
	}
};
