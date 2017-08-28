import Node from '../Node.js';

export default class Property extends Node {
	assignExpression ( expression ) {
		this.value.assignExpression( expression );
	}

	hasEffectsWhenAssigned ( options ) {
		return this.value.hasEffectsWhenAssigned( options );
	}

	render ( code, es ) {
		if ( !this.shorthand ) {
			this.key.render( code, es );
		}
		this.value.render( code, es );
	}
}
