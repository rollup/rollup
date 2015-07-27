export function getName ( x ) {
	return x.name;
}

export function quoteId ( x ) {
	return `'${x.id}'`;
}

export function req ( x ) {
	return `require('${x.id}')`;
}
