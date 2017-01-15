import Node from '../Node.js';
import callHasEffects from './shared/callHasEffects.js';

export default class NewExpression extends Node {
	hasEffects ( scope ) {
		return callHasEffects( scope, this.callee, true );
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

		// TODO context...
		return this.callee.call( this.arguments );
	}
}
