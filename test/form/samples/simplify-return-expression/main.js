export const test = () => {
	console.log(foo());
	console.log(bar());
};

const foo = () => {
	return BUILD ? 'A' : 'B';
};

const bar = () => {
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
		return BUILD ? 'A' : 'B';
	};

	const bar = () => {
		// optimized
		return getBuild() ? 'A' : 'B';
	};

	// optimized away
	const getBuild = () => BUILD;

	// optimized away
	const BUILD = true;

	test();
})();

// optimized away
const BUILD2 = true;

// optimized away
const getBuild2 = () => BUILD2;

export const test2 = () => {
	console.log(foo2());
	console.log(bar2());
};

const foo2 = () => {
	// optimized
	return BUILD2 ? 'A' : 'B';
};

const bar2 = () => {
	// optimized
	return getBuild2() ? 'A' : 'B';
};
