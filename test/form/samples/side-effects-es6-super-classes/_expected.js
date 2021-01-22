class GlobalSuper extends globalThis.UnknownClass {}
new GlobalSuper();

class SideEffectSuper extends (() => {
	console.log( 'effect' );
	return class {};
})() {
}

class SuperConstructorEffect {
	constructor () {
		console.log( 'effect' );
	}
}
class SideEffectsSuperConstructor1 extends SuperConstructorEffect {}
new SideEffectsSuperConstructor1();

class SideEffectsSuperConstructor2 extends SuperConstructorEffect {
	constructor () {
		super();
	}
}
new SideEffectsSuperConstructor2();

class SuperMethodEffect {
	effect () {
		console.log( 'effect' );
	}
}
class SideEffectsSuperMethod extends SuperMethodEffect {
	constructor () {
		super();
		super.effect();
	}
}
new SideEffectsSuperMethod();
