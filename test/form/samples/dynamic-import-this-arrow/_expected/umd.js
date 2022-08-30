(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('input')) :
	typeof define === 'function' && define.amd ? define(['exports', 'input'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}, global.input));
})(this, (function (exports, input) { 'use strict';

	class Importer {
		constructor() {
			this.outputPath = input.outputPath;
		}

		getImport() {
			return import(this.outputPath);
		}
	}

	const promise = new Importer().getImport();

	exports.promise = promise;

}));
