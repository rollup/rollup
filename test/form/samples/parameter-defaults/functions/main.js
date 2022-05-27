var isUndefined;

function funDecl(a = 'retained', b = 'retained', c = 'removed', d = 'removed') {
	console.log(a, b, c);
}

funDecl(isUndefined, 'b', 'c');
funDecl('a', globalThis.unknown, 'c');

const funExp = function (a = 'retained', b = 'retained', c = 'removed', d = 'removed') {
	console.log(a, b, c);
};

funExp(isUndefined, 'b', 'c');
funExp('a', globalThis.unknown, 'c');

const arrow = (a = 'retained', b = 'retained', c = 'removed', d = 'removed') =>
	console.log(a, b, c);

arrow(isUndefined, 'b', 'c');
arrow('a', globalThis.unknown, 'c');
