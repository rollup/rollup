export function getName ( x ) {
	return x.name;
}

export function quoteId ( x ) {
	return `'${x.id}'`;
}

export function req ( x ) {
	return `require('${x.id}')`;
}

export function isImportDeclaration ( statement ) {
	return statement.isImportDeclaration;
}

export function isExportDeclaration ( statement ) {
	return statement.isExportDeclaration;
}
