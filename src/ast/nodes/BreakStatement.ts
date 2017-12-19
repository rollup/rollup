import Node from '../Node';

export default class BreakStatement extends Node {
	hasEffects ( options ) {
		return super.hasEffects( options )
			|| !options.ignoreBreakStatements()
			|| (this.label && !options.ignoreLabel( this.label.name ));
	}
}
