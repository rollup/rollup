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
	assignExpression ( expression ) {
		if ( this.declaration ) {
			this.declaration.assignExpression( expression );
		}
	}

	bind () {
		if ( isReference( this, this.parent ) || isAssignmentPatternLhs( this, this.parent ) ) {
			this.declaration = this.scope.findDeclaration( this.name );
			this.declaration.addReference( this ); // TODO necessary?
		}
	}

	gatherPossibleValues ( values ) {
		if ( isReference( this, this.parent ) ) {
			values.add( this );
		}
	}

	hasEffectsAsExpressionStatement ( options ) {
		return this.hasEffects( options ) || this.declaration.isGlobal;
	}

	hasEffectsWhenAssigned () {
		return this.declaration && this.declaration.included;
	}

	hasEffectsWhenMutated ( options ) {
		return this.declaration &&
			(this.declaration.included ||
			this.declaration.isParam ||
			this.declaration.isGlobal ||
			this.declaration.isExternal ||
			this.declaration.isNamespace ||
			!this.declaration.assignedExpressions ||
			Array.from( this.declaration.assignedExpressions ).some( node => node.hasEffectsWhenMutated( options ) ));
	}

	includeInBundle () {
		if ( this.included ) return false;
		this.included = true;
		this.declaration && this.declaration.includeDeclaration();
		return true;
	}

	render ( code, es ) {
		if ( this.declaration ) {
			const name = this.declaration.getName( es );
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
