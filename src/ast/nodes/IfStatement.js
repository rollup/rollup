import Statement from './shared/Statement.js';
import extractNames from '../utils/extractNames.js';
import { UNKNOWN_VALUE } from '../values.js';

// Statement types which may contain if-statements as direct children.
const statementsWithIfStatements = new Set( [
	'DoWhileStatement',
	'ForInStatement',
	'ForOfStatement',
	'ForStatement',
	'IfStatement',
	'WhileStatement'
] );

function getHoistedVars ( node, scope ) {
	const hoistedVars = [];

	function visit ( node ) {
		if ( node.type === 'VariableDeclaration' && node.kind === 'var' ) {
			node.declarations.forEach( declarator => {
				declarator.init = null;
				declarator.initialise( scope );

				extractNames( declarator.id ).forEach( name => {
					if ( hoistedVars.indexOf( name ) < 0 ) hoistedVars.push( name );
				} );
			} );
		}

		else if ( !/Function/.test( node.type ) ) {
			node.eachChild( visit );
		}
	}

	visit( node );

	return hoistedVars;
}

export default class IfStatement extends Statement {
	initialiseChildren ( parentScope ) {
		super.initialiseChildren( parentScope );
		if ( this.module.bundle.treeshake ) {
			this.testValue = this.test.getValue();

			if ( this.testValue === UNKNOWN_VALUE ) {
				return;
			}
			if ( this.testValue ) {
				if ( this.alternate ) {
					this.hoistedVars = getHoistedVars( this.alternate, this.scope );
					this.alternate = null;
				}
			} else {
				this.hoistedVars = getHoistedVars( this.consequent, this.scope );
				this.consequent = null;
			}
		}
	}

	render ( code, es ) {
		if ( this.module.bundle.treeshake ) {
			if ( this.testValue === UNKNOWN_VALUE ) {
				super.render( code, es );
			}

			else {
				code.overwrite( this.test.start, this.test.end, JSON.stringify( this.testValue ) );

				// TODO if no block-scoped declarations, remove enclosing
				// curlies and dedent block (if there is a block)

				if ( this.hoistedVars ) {
					const names = this.hoistedVars
						.map( name => {
							const declaration = this.scope.findDeclaration( name );
							return declaration.included ? declaration.getName() : null;
						} )
						.filter( Boolean );

					if ( names.length > 0 ) {
						code.appendLeft( this.start, `var ${names.join( ', ' )};\n\n` );
					}
				}

				if ( this.testValue ) {
					code.remove( this.start, this.consequent.start );
					code.remove( this.consequent.end, this.end );
					this.consequent.render( code, es );
				}

				else {
					code.remove( this.start, this.alternate ? this.alternate.start : this.next || this.end );

					if ( this.alternate ) {
						this.alternate.render( code, es );
					}

					else if ( statementsWithIfStatements.has( this.parent.type ) ) {
						code.prependRight( this.start, '{}' );
					}
				}
			}
		}

		else {
			super.render( code, es );
		}
	}
}
