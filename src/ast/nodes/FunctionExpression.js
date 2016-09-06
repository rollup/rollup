import Node from '../Node.js';

export default class FunctionExpression extends Node {
	bind () {
		if ( this.id ) this.id.bind( this.body.scope );
		this.params.forEach( param => param.bind( this.body.scope ) );
		this.body.bind();
	}

	hasEffects () {
		return false;
	}

	initialise () {
		this.body.createScope(); // TODO we'll also need to do this for For[Of|In]Statement

		if ( this.id ) this.id.initialise( this.body.scope );
		this.params.forEach( param => param.initialise( this.body.scope ) );
		this.body.initialise();
	}
}
