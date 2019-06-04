function useRest1(...rest) {
	console.log(rest.length);
}

function useRest2(existing, ...rest) {
	console.log(existing, rest[1]);
}

const needed11 = 1;
const needed12 = 2;
useRest1(needed11, needed12);

const needed21 = 1;
const needed22 = 2;
const needed23 = 4;
useRest2(needed21, needed22, needed23);
