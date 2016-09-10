import Node from '../Node.js';
import callHasEffects from './shared/callHasEffects.js';

export default class NewExpression extends Node {
	hasEffects ( scope ) {
		return callHasEffects( scope, this.callee );
	}
}
