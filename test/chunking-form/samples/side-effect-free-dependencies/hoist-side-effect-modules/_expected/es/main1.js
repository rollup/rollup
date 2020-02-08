import './generated-dep2-effect.js';
import './generated-dep4-effect.js';

var value = 42;

function onlyUsedByOne(value) {
	console.log('Hello', value);
}

onlyUsedByOne(value);
