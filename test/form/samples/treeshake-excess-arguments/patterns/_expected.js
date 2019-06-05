function usePatterns([a, b, ...c], d) {
	console.log(a, b, c, d);
}

const needed1 = 1;
const needed2 = 2;
usePatterns(needed1, needed2);
