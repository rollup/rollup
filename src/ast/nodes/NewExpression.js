import Node from '../Node.js';
import callHasEffects from './shared/callHasEffects.js';

export default class NewExpression extends Node {
	hasEffects () {
		return this.included || callHasEffects( this.scope, this.callee, true );
	}
}
