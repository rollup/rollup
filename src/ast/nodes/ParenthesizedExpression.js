import Node from '../Node.js';

export default class ParenthesizedExpression extends Node {
	getPossibleValues ( values ) {
		return this.expression.getPossibleValues( values );
	}

	getValue () {
		return this.expression.getValue();
	}
}
