import Node from '../Node.js';

export default class Property extends Node {
	assignExpression ( expression ) {
		this.value.assignExpression( expression );
	}

	hasEffectsWhenAssigned () {
		return this.value.hasEffectsWhenAssigned();
	}

	render ( code, es ) {
		if ( !this.shorthand ) {
			this.key.render( code, es );
		}
		this.value.render( code, es );
	}
}
