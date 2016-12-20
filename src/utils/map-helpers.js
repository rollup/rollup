export function getName ( x ) {
	return x.name;
}

export function quotePath ( x ) {
	return `'${x.path}'`;
}

export function req ( x ) {
	return `require('${x.path}')`;
}
