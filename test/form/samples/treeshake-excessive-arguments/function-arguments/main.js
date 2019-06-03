function noParams() {
	console.log();
}
function someUsedParams(p1, p2, p3) {
	console.log(p1, p3);
}
const unneeded1 = 1;

noParams(unneeded1);

const unneeded2 = 1;

const needed21 = 1;
const needed22 = 2;
const needed23 = 3;

someUsedParams(needed21, needed22, needed23, unneeded2);

const noParamsExp = function() {
	console.log();
};
const someUsedParamsExp = function(p1, p2, p3) {
	console.log(p1, p3);
};
const unneeded3 = 1;

noParamsExp(unneeded3);

const unneeded4 = 1;

const needed41 = 1;
const needed42 = 2;
const needed43 = 3;

someUsedParamsExp(needed41, needed42, needed43, unneeded4);

const unneeded5 = 1;

(function() {
	console.log();
}(unneeded5));

const unneeded6 = 1;

const needed61 = 1;
const needed62 = 2;
const needed63 = 3;

(function(p1, p2, p3) {
	console.log(p1, p3);
} (needed61, needed62, needed63, unneeded6));
