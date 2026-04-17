var modules = {
	foo: (unused, exports) => {
		eval('exports.bar = 1');
	}
};

export default modules;
