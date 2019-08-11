const conflict = 'dep';

function getValue() {
	function nestedGetValue() {
		const conflict$1 = 'nested';
		return conflict$1;
	}
	return conflict + nestedGetValue();
}

console.log(getValue());
