class KeySideEffect {
	[console.log( 'effect' )] () {}
}

class ConstructorSideEffect {
	constructor () {
		console.log( 'effect' );
	}
}
new ConstructorSideEffect();

const ConstructorParamSideEffect = class {
	constructor ( foo = console.log( 'effect' ) ) {}
};
new ConstructorParamSideEffect();

const ConstructorParamCallSideEffect = class {
	constructor ( foo = () => console.log( 'effect' ) ) {
		foo();
	}
};
new ConstructorParamCallSideEffect();

const MethodCallSideEffect = class {
	constructor () {
		this.effect();
	}

	effect () {
		console.log( 'effect' );
	}
};
new MethodCallSideEffect();
