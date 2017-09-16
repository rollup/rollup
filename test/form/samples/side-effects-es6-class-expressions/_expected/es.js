class KeySideEffect {
	[console.log( 'effect' )] () {}
}

class ConstructorSideEffect {
	constructor () {
		console.log( 'effect' );
	}
}
const constructorSideEffect = new ConstructorSideEffect();

const ConstructorParamSideEffect = class {
	constructor ( foo = console.log( 'effect' ) ) {}
};
const constructorParamSideEffect = new ConstructorParamSideEffect();

const ConstructorParamCallSideEffect = class {
	constructor ( foo = () => console.log( 'effect' ) ) {
		foo();
	}
};
const constructorParamCallSideEffect = new ConstructorParamCallSideEffect();

const MethodCallSideEffect = class {
	constructor () {
		this.effect();
	}

	effect () {
		console.log( 'effect' );
	}
};
const methodCallSideEffect = new MethodCallSideEffect();
