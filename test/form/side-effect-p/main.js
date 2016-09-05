class ClassWithNoConstructor {
}


// TODO support tree shaking this in the future
class ClassWithConstructor {
  constructor() { }
}

const unusedInstance = new ClassWithNoConstructor();

export default class PublicClass {}