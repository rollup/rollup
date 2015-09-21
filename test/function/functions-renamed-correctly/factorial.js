var x = (function () {
	return function x ( num ) {
		return num <= 2 ? num : num * x( num - 1 );
	};
})();

export { x };
