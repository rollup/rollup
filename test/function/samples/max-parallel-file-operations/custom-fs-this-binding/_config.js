const { promises: fs } = require('node:fs');

class DelegatingFs {
	constructor(realFs) {
		this.realFs = realFs;
	}

	readFile(path, options) {
		return this.realFs.readFile(path, options);
	}

	lstat(path) {
		return this.realFs.lstat(path);
	}

	readdir(path, options) {
		return this.realFs.readdir(path, options);
	}
}

module.exports = defineTest({
	description: 'keeps the this binding of methods of a custom fs implementation',
	options: {
		fs: new DelegatingFs(fs)
	}
});
