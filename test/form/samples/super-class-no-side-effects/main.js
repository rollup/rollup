import { ExternalElement } from './other.js';

class MyClass extends ExternalElement {
	constructor() {
    super();
		console.log('MyClassExtendsExternalClass');
	}
}

console.log('main');
