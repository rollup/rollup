function f(x) {
	return (x ? [] : ['FAIL']).map(o => o);
}
export const a = f(0);
a.splice(0, 1, 'PASS');
