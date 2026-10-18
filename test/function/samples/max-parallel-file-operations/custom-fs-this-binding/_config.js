const { promises: fs } = require('node:fs');

class DelegatingFs {
	constructor(realFs) {
		this.realFs = realFs;
	}

	readFile(path, options) {
		if (!this.realFs) throw new Error('this binding was lost');
		return this.realFs.readFile(path, options);
	}

	lstat(path) {
		if (!this.realFs) throw new Error('this binding was lost');
		return this.realFs.lstat(path);
	}

	readdir(path, options) {
		if (!this.realFs) throw new Error('this binding was lost');
		return this.realFs.readdir(path, options);
	}
}

module.exports = defineTest({
	description: 'maxParallelFileOps: methods of the fs option keep their this binding',
	options: {
		fs: new DelegatingFs(fs)
	}
});
