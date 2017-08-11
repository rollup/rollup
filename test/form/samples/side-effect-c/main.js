var factory = function () {
	function Unused () {}
	Unused.prototype = {};

	return Unused;
};

var Unused = factory();

export default 42;
