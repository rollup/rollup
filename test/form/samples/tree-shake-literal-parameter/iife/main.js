const result = ((enable) => {
	if (enable) {
		return 'enabled';
	} else {
		return 'disabled';
	}
})(true);

const resultFunction = ((enable) => {
	if (enable) {
		return 'enabled';
	} else {
		return 'disabled';
	}
});

console.log(result);
console.log(resultFunction(true));