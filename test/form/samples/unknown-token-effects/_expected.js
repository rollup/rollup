(do {
	() => console.log('retained');
}());
(do {
	null;
}.y);
(do {
	({ y: () => console.log('retained') });
}.y());
(do {
	({
		set y(value) {
			console.log(value);
		}
	});
}.y = 'retained');

const functionUsedInExpr = () => 1;
const objectUsedInExpr = { value: 2 };
const valueUsedInExpr = 3;

const exprValue = do {
	if (unknownCondition1) {
		functionUsedInExpr();
	} else if (unknownCondition2) {
		objectUsedInExpr.value;
	} else if (unknownCondition3) {
		valueUsedInExpr;
	} else {
		'direct value';
	}
};

export { exprValue };
