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

console.log(result1);
console.log(result2);