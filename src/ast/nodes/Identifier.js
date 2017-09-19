import Node from '../Node.js';
import isReference from 'is-reference';

function isAssignmentPatternLhs ( node, parent ) {
	// special case: `({ foo = 42 }) => {...}`
	// `foo` actually has two different parents, the Property of the
	// ObjectPattern, and the AssignmentPattern. In one case it's a
	// reference, in one case it's not, because it's shorthand for
	// `({ foo: foo = 42 }) => {...}`. But unlike a regular shorthand
	// property, the `foo` node appears at different levels of the tree
	return (
		parent.type === 'Property' &&
		parent.shorthand &&
		parent.value.type === 'AssignmentPattern' &&
		parent.value.left === node
	);
}

export default class Identifier extends Node {
	bind () {
		if ( isReference( this, this.parent ) || isAssignmentPatternLhs( this, this.parent ) ) {
			this.variable = this.scope.findVariable( this.name );
			this.variable.addReference( this );
		}
	}

	bindAssignmentAtPath ( path, expression ) {
		if ( this.variable ) {
			this.variable.assignExpressionAtPath( path, expression );
		}
	}

	bindCall ( callOptions ) {
		if ( this.variable ) {
			this.variable.addCall( callOptions );
		}
	}

	hasEffectsAsExpressionStatement ( options ) {
		return this.hasEffects( options ) || this.variable.isGlobal;
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		if ( !this.variable ) {
			return true;
		}
		if ( path.length === 0 ) {
			return this.variable.included;
		}
		return this.hasEffectsWhenMutatedAtPath( path.slice( 0, -1 ), options );
	}

	hasEffectsWhenCalled ( options ) {
		if ( !this.variable ) {
			return true;
		}
		return this.variable.hasEffectsWhenCalled( options );
	}

	hasEffectsWhenMutatedAtPath ( path, options ) {
		if ( !this.variable ) {
			return true;
		}
		return this.variable.hasEffectsWhenMutatedAtPath( path, options );
	}

	includeInBundle () {
		if ( this.included ) return false;
		this.included = true;
		this.variable && this.variable.includeVariable();
		return true;
	}

	initialiseAndDeclare ( parentScope, kind, init ) {
		this.initialiseScope( parentScope );
		switch ( kind ) {
			case 'var':
			case 'function':
				this.scope.addDeclaration( this, { isHoisted: true, init } );
				break;
			case 'let':
			case 'const':
			case 'class':
				this.scope.addDeclaration( this, { init } );
				break;
			case 'parameter':
				this.scope.addParameterDeclaration( this );
				break;
			default:
				throw new Error( 'Unexpected identifier kind', kind );
		}
	}

	render ( code, es ) {
		if ( this.variable ) {
			const name = this.variable.getName( es );
			if ( name !== this.name ) {
				code.overwrite( this.start, this.end, name, { storeName: true, contentOnly: false } );

				// special case
				if ( this.parent.type === 'Property' && this.parent.shorthand ) {
					code.appendLeft( this.start, `${this.name}: ` );
				}
			}
		}
	}
}
