import Node from '../Node.js';
import extractNames from '../utils/extractNames.js';

export default class VariableDeclarator extends Node {
	assignExpression ( expression ) {
		this.id.assignExpression( expression );
	}

	initialiseDeclarator ( parentScope, kind ) {
		this.initialiseScope( parentScope );
		this.init && this.init.initialise( this.scope );
		this.id.initialiseAndDeclare( this.scope, kind, this.init );
	}

	render ( code, es ) {
		extractNames( this.id ).forEach( name => {
			const declaration = this.scope.findDeclaration( name );

			if ( !es && declaration.exportName && declaration.isReassigned ) {
				if ( this.init ) {
					code.overwrite( this.start, this.id.end, declaration.getName( es ) );
				} else if ( this.module.bundle.treeshake ) {
					code.remove( this.start, this.end );
				}
			}
		} );

		super.render( code, es );
	}
}
