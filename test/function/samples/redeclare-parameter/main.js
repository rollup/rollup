function fnDecl(a) {
	var a;
	if (!a) {
		throw Error("a was incorrectly assumed to be undefined in a function declaration");
	}
}
fnDecl(true);

export const fnExp = function(a) {
	var a;
	if (!a) {
		throw Error("a was incorrectly assumed to be undefined in a function expression");
	}
};
fnExp(true);

export const arrowFn = a => {
	var a;
	if (!a) {
		throw Error("a was incorrectly assumed to be undefined in an arrow function");
	}
};
arrowFn(true);
