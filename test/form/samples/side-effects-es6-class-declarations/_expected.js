class KeySideEffect {
	[console.log( 'effect' )] () {}
}

class ConstructorSideEffect {
	constructor () {
		console.log( 'effect' );
	}
}
new ConstructorSideEffect();

class ConstructorParamSideEffect {
	constructor ( foo = console.log( 'effect' ) ) {}
}
new ConstructorParamSideEffect();

class ConstructorParamCallSideEffect {
	constructor ( foo = () => console.log( 'effect' ) ) {
		foo();
	}
}
new ConstructorParamCallSideEffect();

class MethodCallSideEffect {
	constructor () {
		this.effect();
	}

	effect () {
		console.log( 'effect' );
	}
}
new MethodCallSideEffect();
