import { Component } from 'external';

class Foo extends Component {
	constructor () {
		super();
		this.isFoo = true;
	}
}

class Bar extends Component {
	constructor () {
		super();
		this.isBar = true;
	}
}

class Baz extends Component {
	constructor () {
		super();
		this.isBaz = true;
	}
}

const foo = new Foo();
const bar = new Bar();
const baz = new Baz();

export { foo, bar, baz };
