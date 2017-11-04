import Node from '../Node.js';
import CallOptions from '../CallOptions';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class NewExpression extends Node {
	bindNode () {
		this.callee.bindCallAtPath( [], this._callOptions, ExecutionPathOptions.create() );
	}

	hasEffects ( options ) {
		return this.arguments.some( child => child.hasEffects( options ) )
			|| this.callee.hasEffectsWhenCalledAtPath( [], this._callOptions, options.getHasEffectsWhenCalledOptions() );
	}

	hasEffectsWhenAccessedAtPath ( path ) {
		return path.length > 1;
	}

	initialiseNode () {
		this._callOptions = CallOptions.create( { withNew: true, args: this.arguments, caller: this } );
	}
}
