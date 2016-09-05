class ClassWithSideEffects {
  constructor( arg ) { arg.myBad = 'sorry'; }
}

const unusedInstance2 = new ClassWithSideEffects( PublicClass );

class PublicClass {}

export default PublicClass;