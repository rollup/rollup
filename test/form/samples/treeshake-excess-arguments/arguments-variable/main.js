function useArguments1() {
	console.log(arguments.length);
}

function useArguments2(existing) {
	console.log(existing, arguments[1]);
}

const needed11 = 1;
const needed12 = 2;
useArguments1(needed11, needed12);

const needed21 = 1;
const needed22 = 2;
useArguments2(needed21, needed22);
