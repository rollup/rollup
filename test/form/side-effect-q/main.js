class ClassWithConstructor {
  constructor ( arg ) { this.foo = arg; }
}

class ClassWithSideEffects {
  constructor( arg ) { arg.myBad = 'sorry'; }
}

const unusedInstance = new ClassWithConstructor( 3 );
const unusedInstance2 = new ClassWithSideEffects( PublicClass );

export default class PublicClass {}