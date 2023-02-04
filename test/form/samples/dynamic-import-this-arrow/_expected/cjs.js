'use strict';

var input = require('input');

function _interopNamespaceDefault(e) {
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(k => {
			if (k !== 'default') {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: () => e[k]
				});
			}
		});
	}
	n.default = e;
	return Object.freeze(n);
}

class Importer {
	constructor() {
		this.outputPath = input.outputPath;
	}

	getImport() {
		return Promise.resolve().then(() => /*#__PURE__*/_interopNamespaceDefault(require(this.outputPath)));
	}
}

const promise = new Importer().getImport();

exports.promise = promise;
