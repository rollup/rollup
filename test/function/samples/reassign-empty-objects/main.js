const map = {};

map.a = true;

function checkMap(key, expected) {
	const result = map[key];
	if (!result && expected) {
		throw new Error('Result was false but should have been true');
	}
	if (result && !expected) {
		throw new Error('Result was true but should have been false');
	}
}

checkMap('a', true);
checkMap('b', false);
