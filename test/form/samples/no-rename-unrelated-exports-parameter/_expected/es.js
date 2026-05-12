var modules = {
	foo: (unused, exports) => {
		console.log(exports.bar);
		eval('exports.bar = 1');
	}
};

export { modules as default };
