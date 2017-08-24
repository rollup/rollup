var foo = () => {};
foo = 3;
foo = 'foo';
foo = function () {
	console.log('effect');
};
foo = ['foo'];
foo = undefined;

var noEffect = () => {};
noEffect = function(a) {
	a = 'reassigned parameter';
};

var stillNoEffect = () => {};
stillNoEffect = noEffect;
stillNoEffect();

var effect = () => {};
effect = function() {
	console.log('effect');
};

var alsoEffect = () => {};
alsoEffect = effect;
alsoEffect();
