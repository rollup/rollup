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

	initialise ( scope ) {
		this.body.createScope( scope );

		if ( this.id ) this.id.initialise( this.body.scope );
		this.params.forEach( param => param.initialise( this.body.scope ) );
		this.body.initialise();
	}
}
