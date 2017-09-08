const Empty = class {};
const empty = new Empty();

const NoSideEffects = class {
	constructor ( foo = 1 ) {
		this.x = 1;
		const mutateThis = () => this.y = 1;
		mutateThis();
	}

	method1 () {
		this.method2();
	}

	[(() => 'method2')()] () {
		console.log( 'not called' );
	}
};
const noSideEffects = new NoSideEffects();

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
