import Node from '../Node.js';
import callHasEffects from './shared/callHasEffects.js';

export default class NewExpression extends Node {
	hasEffects ( scope ) {
		if ( callHasEffects( scope, this.callee, true ) ) return true;

		for ( let i = 0; i < this.arguments.length; i += 1 ) {
			const arg = this.arguments[i];
			if ( arg.hasEffects( scope ) ) return true;

			// if a function is passed to a function, assume it is called
			if ( callHasEffects( scope, arg, false ) ) return true;
		}
	}
}
