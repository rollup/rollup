export function fnDecl(a) {
	var a;
	return a ? 1 : 0;
}

export const fnExp = function(a) {
	var a;
	return a ? 1 : 0;
};

export const arrowFn = a => {
	var a;
	return a ? 1 : 0;
};
