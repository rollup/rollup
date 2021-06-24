const test = () => {
	console.log(foo());
	console.log(bar());
};

const foo = () => {
	// TODO: treeshake optimization regression.
	return BUILD ? 'A' : 'B';
};

const bar = () => {
	// TODO: treeshake optimization regression.
	return getBuild() ? 'A' : 'B';
};

const getBuild = () => BUILD;

const BUILD = true;

(function() {
	const test = () => {
		console.log(foo());
		console.log(bar());
	};

	const foo = () => {
		// optimized
		return 'A' ;
	};

	const bar = () => {
		// optimized
		return 'A' ;
	};

	test();
})();

const test2 = () => {
	console.log(foo2());
	console.log(bar2());
};

const foo2 = () => {
	// optimized
	return 'A' ;
};

const bar2 = () => {
	// optimized
	return 'A' ;
};

export { test, test2 };
