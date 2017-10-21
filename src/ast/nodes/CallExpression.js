import Node from '../Node.js';
import CallOptions from '../CallOptions';

export default class CallExpression extends Node {
	bindNode () {
		if ( this.callee.type === 'Identifier' ) {
			const variable = this.scope.findVariable( this.callee.name );

			if ( variable.isNamespace ) {
				this.module.error( {
					code: 'CANNOT_CALL_NAMESPACE',
					message: `Cannot call a namespace ('${this.callee.name}')`
				}, this.start );
			}

			if ( this.callee.name === 'eval' && variable.isGlobal ) {
				this.module.warn( {
					code: 'EVAL',
					message: `Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification`,
					url: 'https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval'
				}, this.start );
			}
		}
	}

	hasEffects ( options ) {
		return this.arguments.some( child => child.hasEffects( options ) )
			|| this.callee.hasEffectsWhenCalledAtPath( [], this._callOptions, options.getHasEffectsWhenCalledOptions() );
	}

	hasEffectsWhenAccessedAtPath ( path, options ) {
		return path.length > 0
			&& !options.hasReturnExpressionBeenAccessedAtPath( path, this )
			&& this.callee.someReturnExpressionWhenCalledAtPath( [], this._callOptions, innerOptions => node =>
				node.hasEffectsWhenAccessedAtPath( path, innerOptions.addAccessedReturnExpressionAtPath( path, this ) ), options );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		return !options.hasReturnExpressionBeenAssignedAtPath( path, this )
			&& this.callee.someReturnExpressionWhenCalledAtPath( [], this._callOptions, innerOptions => node =>
				node.hasEffectsWhenAssignedAtPath( path, innerOptions.addAssignedReturnExpressionAtPath( path, this ) ), options );
	}

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		return !options.hasReturnExpressionBeenCalledAtPath( path, this )
			&& this.callee.someReturnExpressionWhenCalledAtPath( [], this._callOptions, innerOptions => node =>
				node.hasEffectsWhenCalledAtPath( path, callOptions, innerOptions.addCalledReturnExpressionAtPath( path, this ) ), options );
	}

	initialiseNode () {
		this._callOptions = CallOptions.create( { withNew: false, args: this.arguments } );
	}

	someReturnExpressionWhenCalledAtPath ( path, callOptions, predicateFunction, options ) {
		return this.callee.someReturnExpressionWhenCalledAtPath( [], this._callOptions, innerOptions => node =>
			node.someReturnExpressionWhenCalledAtPath( path, callOptions, predicateFunction, innerOptions ), options );
	}
}
