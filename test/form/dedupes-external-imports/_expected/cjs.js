'use strict';

var external = require('external');

class Foo extends external.Component {
	constructor () {
		super();
		this.isFoo = true;
	}
}

class Bar extends external.Component {
	constructor () {
		super();
		this.isBar = true;
	}
}

class Baz extends external.Component {
	constructor () {
		super();
		this.isBaz = true;
	}
}

const foo = new Foo();
const bar = new Bar();
const baz = new Baz();
