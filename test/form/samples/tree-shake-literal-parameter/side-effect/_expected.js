function foo1() {
	return 1;
}

function bar1(foo) {
	console.log(foo());
}

function bar2(foo) {
}

// not pure, preserve
function foo3() {
	console.log(1);
}

function bar3(foo) {
	foo();
}

console.log(bar1(foo1), bar2(), bar3(foo3));

const options = {
	enable: 1
};

const options2 = {
	enable: 1
};

function calledWithSameVariable(options) {
	{
		return 'enabled';
	}
}

function calledWithDifferentVariable(options) {
	if (options.enable) {
		return 'enabled';
	} else {
		return 'disabled';
	}
}

// forward hasEffects to `options`
console.log(calledWithSameVariable(), calledWithSameVariable());
// no optimization
console.log(calledWithDifferentVariable(options), calledWithDifferentVariable(options2));

const optionsBeModified = {
	enable: 1
};

function calledWithModifiedVariable(options) {
	if (options.enable) {
		return 'enabled';
	} else {
		return 'disabled';
	}
}

console.log(calledWithModifiedVariable(optionsBeModified));
optionsBeModified.enable = 0;
