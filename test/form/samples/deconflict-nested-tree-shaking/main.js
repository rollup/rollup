import * as dep from './dep.js';

function getValue() {
	function nestedGetValue() {
		const conflict$1 = 'nested';
		if (false) {
			console.log(conflict);
		}
		return conflict$1;
	}

	const conflict = 'main';
	return dep.conflict + nestedGetValue();
}

console.log(getValue());
