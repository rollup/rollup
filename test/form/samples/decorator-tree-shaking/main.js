// retained
function decorator() {
	console.log('effect');
}

@decorator
class Main {}

// retained
function decorator2() {
	console.log('effect');
}

class Main2 {
	@decorator2
	a = 1;
}

// retained
function decorator3() {
	console.log('effect');
}
class Main3 {
	@decorator3
	a() {}
}

// removed
function decorator4() {}

@decorator4
class Main4 {
	@decorator4
	a = 1;
	@decorator4
	b() {}
}

// retained
function decorator5() {
	console.log('effect');
	return () => {};
}
@decorator5()
class Main5 {}

// retained
function decorator6() {
	return () => {
		console.log('effect');
	};
}
@decorator6()
class Main6 {}

// removed
function decorator7() {
	return () => {};
}
@decorator7()
class Main7 {}

// retained
function decorator8() {
	console.log('effect');
	return () => {};
}

@(false || decorator8())
class Main8 {}
