(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('dns'), require('util'), require('fs')) :
	typeof define === 'function' && define.amd ? define(['dns', 'util', 'fs'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.dns, global.util, global.fs));
})(this, (function (dns, util, fs) { 'use strict';

	dns.resolve('name');
	fs.writeFileSync('foo', 'bar');

}));
