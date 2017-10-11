import Node from '../Node.js';

export default class CallExpression extends Node {
	bind () {
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

		super.bind();
	}

	hasEffects ( options ) {
		return this.included
			|| this.arguments.some( child => child.hasEffects( options ) )
			|| this.callee.hasEffectsWhenCalledAtPath( [], { withNew: false }, options.getHasEffectsWhenCalledOptions() );
	}

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		return this.callee.someReturnExpressionAtPath( path, { withNew: false }, ( relativePath, node ) =>
			node.hasEffectsWhenCalledAtPath( relativePath, callOptions, options ) );
	}

	someReturnExpressionAtPath ( path, callOptions, predicateFunction ) {
		return this.callee.someReturnExpressionAtPath( path, { withNew: false }, ( relativePath, node ) =>
			node.someReturnExpressionAtPath( relativePath, callOptions, predicateFunction ) );
	}
}
