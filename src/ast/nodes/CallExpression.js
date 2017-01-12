import Node from '../Node.js';
import callHasEffects from './shared/callHasEffects.js';

export default class CallExpression extends Node {
	bind ( scope ) {
		if ( this.callee.type === 'Identifier' ) {
			const declaration = scope.findDeclaration( this.callee.name );

			if ( declaration.isNamespace ) {
				this.module.error({
					code: 'CANNOT_CALL_NAMESPACE',
					message: `Cannot call a namespace ('${this.callee.name}')`
				}, this.start );
			}

			if ( this.callee.name === 'eval' && declaration.isGlobal ) {
				this.module.warn({
					code: 'EVAL',
					message: `Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification`,
					url: 'https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval'
				}, this.start );
			}
		}

		super.bind( scope );
	}

	getProperty ( name ) {
		// TODO unknown properties
		return this.getValue().getProperty( name );
	}

	getValue () {
		console.log( `TODO getValue ${this}` )

		return this.callee.getReturnValue( this.arguments );
	}

	hasEffects ( scope ) {
		return callHasEffects( scope, this.callee, false );
	}

	initialise ( scope ) {
		this.scope = scope;
		super.initialise( scope );
	}

	isUsedByBundle () {
		return this.hasEffects( this.findScope() );
	}

	mark () {
		if ( this.isMarked ) return;
		this.isMarked = true;

		if ( !this.callee.markReturnStatements ) {
			throw new Error( `${this.callee} does not have markReturnStatements method` );
		}

		// TODO should there be a more general way to handle this? marking a
		// statement marks children (down to a certain barrier) as well as
		// its parents? or is CallExpression a special case?
		this.callee.mark();
		this.arguments.forEach( arg => arg.mark() );

		this.callee.markReturnStatements( this.arguments );

		if ( this.parent.mark ) this.parent.mark();
	}

	run () {
		this.module.bundle.potentialEffects.push( this );

		if ( !this.callee.call ) {
			throw new Error( `${this.callee} does not have call method` );
		}

		this.callee.call( this.arguments );

		super.run();
	}
}
