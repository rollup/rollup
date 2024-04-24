const result1 = ((enable) => {
	if (enable) {
		return 'enabled';
	} else {
		return 'disabled';
	}
})(true);

const result2 = (function (enable) {
	if (enable) {
		return 'enabled';
	} else {
		return 'disabled';
	}
})(true);

const result3 = (function foo (enable) {
	if (enable) {
		return 'enabled';
	} else {
		return 'disabled';
	}
})(true);

// lose track of iife
const result4 = (function foo (enable) {
	if (enable) {
		unknown_global_function(foo);
		return 'enabled';
	} else {
		return 'disabled';
	}
})(true);

console.log(result1);
console.log(result2);
console.log(result3);
console.log(result4);
