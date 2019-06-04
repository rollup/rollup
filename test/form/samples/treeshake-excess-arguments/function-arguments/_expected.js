function noParams() {
	console.log();
}
function someUsedParams(p1, p2, p3) {
	console.log(p1, p3);
}

noParams();

const needed21 = 1;
const needed22 = 2;
const needed23 = 3;

someUsedParams(needed21, needed22, needed23);

const noParamsExp = function() {
	console.log();
};
const someUsedParamsExp = function(p1, p2, p3) {
	console.log(p1, p3);
};

noParamsExp();

const needed41 = 1;
const needed42 = 2;
const needed43 = 3;

someUsedParamsExp(needed41, needed42, needed43);

(function() {
	console.log();
}());

const needed61 = 1;
const needed62 = 2;
const needed63 = 3;

(function(p1, p2, p3) {
	console.log(p1, p3);
} (needed61, needed62, needed63));
