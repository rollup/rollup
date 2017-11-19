var foo = () => {};
foo = 3;
foo = 'foo';
foo = function () {
	console.log('effect');
};
foo = ['foo'];
foo = undefined;

var noEffect = function(a) {
	a = 'reassigned parameter';
};

var stillNoEffect = noEffect;
stillNoEffect();

var effect = function() {
	console.log('effect');
};

var alsoEffect = effect;
alsoEffect();
